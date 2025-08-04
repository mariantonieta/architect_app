import { useEffect, useRef, useState } from "react";
import * as OBC from "@thatopen/components";
import * as THREE from "three";
import * as OBCF from "@thatopen/components-front";
import { useTheme } from "../../hooks/useTheme";
import "./ifc-viewer.css";

type IFCViewerProps = {
  fileUrl?: string | null;
};

export function IFCViewer({ fileUrl }: IFCViewerProps) {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [loader, setLoader] = useState<OBC.IfcLoader | null>(null);
  const [world, setWorld] = useState<OBC.SimpleWorld | null>(null);
  const [components, setComponents] = useState<OBC.Components | null>(null);
  const [currentModel, setCurrentModel] = useState<THREE.Object3D | null>(null);

  // Función para obtener el color de fondo según el tema
  const getBackgroundColor = (currentTheme: "light" | "dark") => {
    switch (currentTheme) {
      case "dark":
        return new THREE.Color(0x1a1a1a);
      case "light":
      default:
        return new THREE.Color(0xf5f5f5);
    }
  };

  useEffect(() => {
    async function init() {
      if (!containerRef.current) {
        console.warn("Container ref no está disponible todavía");
        return;
      }

      try {
        console.log("Inicializando IFC Viewer...");
        const c = new OBC.Components();
        setComponents(c);

        const w = c.get(OBC.Worlds).create();
        w.scene = new OBC.SimpleScene(c);
        w.renderer = new OBC.SimpleRenderer(c, containerRef.current);
        w.camera = new OBC.SimpleCamera(c);
        setWorld(w);
        c.init();
        console.log("Componentes IFC inicializados correctamente");

        // Configurar fondo con el tema seleccionado
        w.scene.three.background = getBackgroundColor(theme);

        // Configuración de iluminación mejorada
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);

        // Luz direccional principal
        const directional = new THREE.DirectionalLight(0xffffff, 0.8);
        directional.position.set(10, 10, 10);
        directional.castShadow = true;
        directional.shadow.mapSize.width = 2048;
        directional.shadow.mapSize.height = 2048;

        // Luz adicional para eliminar sombras duras
        const directional2 = new THREE.DirectionalLight(0xffffff, 0.4);
        directional2.position.set(-10, -10, 5);

        // Luz hemisférica para suavizar la iluminación
        const hemisphere = new THREE.HemisphereLight(0xffffff, 0x444444, 0.3);

        w.scene.three.add(ambient, directional, directional2, hemisphere);

        // Configurar renderer para mejor calidad
        const renderer = w.renderer.three;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;

        // Asegurar que el renderer tenga el tamaño correcto
        renderer.setSize(
          containerRef.current.clientWidth,
          containerRef.current.clientHeight
        );
        renderer.setPixelRatio(window.devicePixelRatio);

        const grids = c.get(OBC.Grids);
        grids.create(w);

        const workerUrl = "/workers/fragments.worker.js";
        const fragments = c.get(OBC.FragmentsManager);
        fragments.init(workerUrl);

        const highlighter = c.get(OBCF.Highlighter);
        highlighter.setup({
          world: w,
          selectMaterialDefinition: {
            color: new THREE.Color("#2563eb"), // Azul más profesional
            opacity: 0.8,
            transparent: true,
            renderedFaces: 0,
          },
        });

        // Configurar eventos de selección (simplificado)
        highlighter.events.select.onHighlight.add((fragmentIdMap) => {
          console.log("Elemento seleccionado:", fragmentIdMap);
        });

        // Trigger inicial del render para asegurar que se muestre correctamente
        w.renderer.update();

        const ifcLoader = c.get(OBC.IfcLoader);
        ifcLoader.settings.wasm = {
          path: "https://unpkg.com/web-ifc@0.0.68/",
          absolute: true,
        };

        await ifcLoader.setup();
        setLoader(ifcLoader);

        console.log("IFC Viewer inicializado completamente");
      } catch (error) {
        console.error("Error al inicializar IFC Viewer:", error);
      }
    }

    init();
  }, [theme]);

  // Efecto para redimensionar el renderer cuando cambie el tamaño del contenedor
  useEffect(() => {
    if (!world || !containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (world.renderer && containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        world.renderer.three.setSize(clientWidth, clientHeight);
        world.camera.three.aspect = clientWidth / clientHeight;
        world.camera.three.updateProjectionMatrix();
        world.renderer.update();
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [world]);

  // Efecto para cambiar el tema
  useEffect(() => {
    if (world) {
      world.scene.three.background = getBackgroundColor(theme);
      world.renderer.update();
    }
  }, [theme, world]);

  useEffect(() => {
    async function loadFromUrl() {
      if (!fileUrl || !loader || !components || !world) return;

      try {
        if (currentModel) {
          world.scene.three.remove(currentModel);
          currentModel.traverse((child) => {
            if ((child as any).geometry) (child as any).geometry.dispose();
            if ((child as any).material) {
              const materials = Array.isArray((child as any).material)
                ? (child as any).material
                : [(child as any).material];
              materials.forEach((m) => m.dispose());
            }
          });
        }
        const response = await fetch(fileUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);
        const model = await loader.load(buffer, new THREE.Matrix4(), fileUrl);

        model.useCamera(world.camera.three);

        // Mejorar la apariencia del modelo
        model.object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            // Mejorar materiales
            if (child.material) {
              const materials = Array.isArray(child.material)
                ? child.material
                : [child.material];

              materials.forEach((material) => {
                if (material instanceof THREE.MeshStandardMaterial) {
                  material.roughness = 0.5;
                  material.metalness = 0.1;
                  material.envMapIntensity = 0.3;
                }
              });
            }
          }
        });

        world.scene.three.add(model.object);
        components.get(OBC.FragmentsManager).core.update(true);

        const box = new THREE.Box3().setFromObject(model.object);
        const sphere = new THREE.Sphere();
        box.getBoundingSphere(sphere);

        if (!sphere.isEmpty()) {
          await world.camera.controls.fitToSphere(sphere, true);

          // Configurar controles de cámara para mejor experiencia
          const controls = world.camera.controls;
          controls.dampingFactor = 0.05;
          controls.minDistance = sphere.radius * 0.1;
          controls.maxDistance = sphere.radius * 10;
          controls.maxPolarAngle = Math.PI;

          world.renderer.update();
        }

        setCurrentModel(model.object);
        console.log("Modelo IFC cargado desde URL:", fileUrl);
      } catch (err) {
        console.error(" Error al cargar el IFC desde URL:", err);
      }
    }

    loadFromUrl();
  }, [fileUrl, loader, components, world]);

  return (
    <div className="container">
      <div ref={containerRef} className="viewer" />
    </div>
  );
}
