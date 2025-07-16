import { useEffect, useRef, useState } from "react";
import * as OBC from "@thatopen/components";
import * as THREE from "three";
import Stats from "stats.js";
import * as OBCF from "@thatopen/components-front";
import "./ifc-viewer.css"; type IFCViewerProps = {
  fileUrl?: string | null;
};

export function IFCViewer({ fileUrl }: IFCViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loader, setLoader] = useState<OBC.IfcLoader | null>(null);
  const [world, setWorld] = useState<OBC.SimpleWorld | null>(null);
  const [components, setComponents] = useState<OBC.Components | null>(null);

  useEffect(() => {
    async function init() {
      const c = new OBC.Components();
      setComponents(c);

      const w = c.get(OBC.Worlds).create();
      w.scene = new OBC.SimpleScene(c);
      w.renderer = new OBC.SimpleRenderer(c, containerRef.current!);
      w.camera = new OBC.SimpleCamera(c);
      setWorld(w);
      c.init();

      w.scene.three.background = new THREE.Color(0x000000);

      const ambient = new THREE.AmbientLight(0xffffff, 1.5);
      const directional = new THREE.DirectionalLight(0xffffff, 1);
      directional.position.set(10, 10, 10);
      w.scene.three.add(ambient, directional);

      const grids = c.get(OBC.Grids);
      grids.create(w);

      const workerUrl = "/workers/fragments.worker.js";
      const fragments = c.get(OBC.FragmentsManager);
      fragments.init(workerUrl);

      const highlighter = c.get(OBCF.Highlighter);
      highlighter.setup({
        world: w,
        selectMaterialDefinition: {
          color: new THREE.Color("cyan"),
          opacity: 1,
          transparent: false,
          renderedFaces: 0,
        },
      });

      const stats = new Stats();
      stats.showPanel(0);
      document.body.appendChild(stats.dom);
      w.renderer.onBeforeUpdate.add(() => stats.begin());
      w.renderer.onAfterUpdate.add(() => stats.end());

      const ifcLoader = c.get(OBC.IfcLoader);
      ifcLoader.settings.wasm = {
        path: "https://unpkg.com/web-ifc@0.0.68/",
        absolute: true,
      };

      await ifcLoader.setup();
      setLoader(ifcLoader);

      return () => {
        stats.dom.remove();
      };
    }

    init();
  }, []);
  useEffect(() => {
    async function loadFromUrl() {
      if (!fileUrl || !loader || !components || !world) return;

      try {
        const response = await fetch(fileUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);
        const model = await loader.load(buffer, new THREE.Matrix4(), fileUrl);

        model.useCamera(world.camera.three);
        world.scene.three.add(model.object);
        components.get(OBC.FragmentsManager).core.update(true);

        const box = new THREE.Box3().setFromObject(model.object);
        const sphere = new THREE.Sphere();
        box.getBoundingSphere(sphere);

        if (!sphere.isEmpty()) {
          await world.camera.controls.fitToSphere(sphere, true);
          world.renderer.update();
        }

        console.log("Modelo IFC cargado desde URL:", fileUrl);
      } catch (err) {
        console.error(" Error al cargar el IFC desde URL:", err);
      }
    }

    loadFromUrl();
  }, [fileUrl, loader, components, world]);

  return (
    <div>
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "600px",
          border: "1px solid #ccc",
          backgroundColor: "#222",
        }}
      />
    </div>
  );
}
