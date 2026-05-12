import io
import logging
import re
from typing import List, Optional

from concurrent.futures import ThreadPoolExecutor
import asyncio
import boto3
from botocore.client import Config
from fastapi import  HTTPException

from app.core.config import settings


MINIO_ENDPOINT = settings.MINIO_ENDPOINT
MINIO_ACCESS_KEY = settings.MINIO_ACCESS_KEY
MINIO_SECRET_KEY = settings.MINIO_SECRET_KEY
MINIO_BUCKET_NAME = settings.MINIO_BUCKET_NAME

s3_client = boto3.client(
    "s3",
    endpoint_url=f"http://{MINIO_ENDPOINT}",
    aws_access_key_id=MINIO_ACCESS_KEY,
    aws_secret_access_key=MINIO_SECRET_KEY,
    config=Config(signature_version="s3v4"),
    region_name="us-east-1",
)

logger = logging.getLogger(__name__)
executor = ThreadPoolExecutor()


def sanitize_filename(filename: str) -> str:
    """Sanitiza nombres de archivo eliminando caracteres problemáticos."""
    return re.sub(r"[^a-zA-Z0-9_.-]", "_", filename)


def upload_file_to_minio(file_bytes: bytes, filename: str, content_type: Optional[str]) -> str:
    logger.info(f"Usando bucket: {MINIO_BUCKET_NAME}")

    try:
        logger.info(f"Intentando subir archivo: {filename} con tipo {content_type}")

        # Validar y limpiar nombre del archivo
        safe_filename = sanitize_filename(filename)

        # Asegurar tipo MIME válido
        content_type = content_type or "application/octet-stream"

        # Validar bucket
        try:
            s3_client.head_bucket(Bucket=MINIO_BUCKET_NAME)
        except Exception as e:
            logger.error(f"El bucket {MINIO_BUCKET_NAME} no está disponible: {e}")
            raise HTTPException(status_code=500, detail=f"Bucket no disponible: {MINIO_BUCKET_NAME}")

        file_stream = io.BytesIO(file_bytes)
        file_stream.seek(0)

        logger.info(f"Tamaño del archivo: {len(file_bytes)} bytes")
        logger.info(f"Subiendo archivo {safe_filename} a MinIO...")

        s3_client.upload_fileobj(
            Fileobj=file_stream,
            Bucket=MINIO_BUCKET_NAME,
            Key=safe_filename,
            ExtraArgs={"ContentType": content_type}
        )

        logger.info(f"Archivo {safe_filename} subido correctamente.")

        url = f"http://{MINIO_ENDPOINT}/{MINIO_BUCKET_NAME}/{safe_filename}"
        logger.info(f"URL del archivo: {url}")
        return url

    except Exception as e:
        logger.exception(f"Error subiendo archivo a MinIO")
        raise HTTPException(status_code=500, detail=f"Error al subir archivo {filename} a MinIO: {str(e)}")


async def upload_file_to_minio_async(file_bytes: bytes, filename: str, content_type: str) -> str:
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(
        executor, upload_file_to_minio, file_bytes, filename, content_type
    )


def generate_presigned_url(filename: str, expiration: int = 3600) -> str:
    try:
        safe_filename = sanitize_filename(filename)
        url = s3_client.generate_presigned_url(
            ClientMethod="get_object",
            Params={"Bucket": MINIO_BUCKET_NAME, "Key": safe_filename},
            ExpiresIn=expiration,
        )
        return url
    except Exception as e:
        logger.exception("Error generando presigned URL")
        raise RuntimeError(f"Error generating presigned URL: {str(e)}")
