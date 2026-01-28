# Test Results Upload Pipeline

Este workflow se encarga de centralizar la gestión de reportes y capturas de pantalla generados por la suite de tests.

## Funcionamiento

El archivo `.github/workflows/upload_results.yml` se activa automáticamente mediante el evento `workflow_run` cuando la pipeline principal **"Unified Test Suite"** finaliza correctamente (`success`).

### Pasos del Proceso:

1. **Trigger**: Detecta la finalización de `Unified Test Suite`.
2. **Checkout**: Descarga el código de la rama específica que originó los tests.
3. **Download Artifacts**: Recupera los resultados almacenados temporalmente por la pipeline de tests:
   - `api-reports`: Reportes de las pruebas de API.
   - `gui-reports`: Reportes de las pruebas de GUI.
   - `gui-screenshots`: Capturas de pantalla de los fallos (o estados finales) de la GUI.
4. **Merge & Commit**: 
   - Organiza los reportes en la carpeta `reports/`.
   - Organiza las capturas en `features/resources/screenshots/`.
   - Realiza un commit automático con el mensaje `docs: auto-generate integrated test reports and screenshots [skip ci]`.
5. **Push**: Sube los cambios directamente a la rama correspondiente.

## Ventajas de este Enfoque

- **Desacoplamiento**: La ejecución de los tests no se ve afectada por posibles errores en la subida de archivos o conflictos de git.
- **Limpieza**: La pipeline de tests se enfoca únicamente en validar el código, mientras que esta pipeline se encarga de la documentación y los artefactos.
- **Persistencia**: Asegura que los reportes estén siempre actualizados en el repositorio sin necesidad de intervención manual.

## Notas Adicionales

- Se utiliza el tag `[skip ci]` en el commit para evitar bucles infinitos de ejecución de pipelines.
- Se requieren permisos de escritura en el repositorio (`contents: write`) para que esta pipeline pueda realizar el push.
