# Screenshot Visualization in Test Reports

## Overview
Los screenshots capturados durante la ejecución de tests se visualizan automáticamente en los reportes.

## Características

### 1. Screenshots Manuales
Cuando usas los steps:
```gherkin
Then I take a screenshot named "dashboard_home"
Then I take a full page screenshot named "complete_view"
```

Los screenshots se:
- ✅ Guardan en `features/resources/screenshots/`
- ✅ Se imprimen en la consola con formato HTML
- ✅ Se incluyen en reportes HTML de Behave

### 2. Screenshots Automáticos en Fallos
Cuando un step falla:
- ✅ Se captura automáticamente un screenshot
- ✅ Nombre: `FAILED_{scenario}_{timestamp}.png`
- ✅ Se muestra en el output del test

## Formato de Output

### En Consola
```
📸 Screenshot captured: dashboard_home
   Location: features/resources/screenshots/dashboard_home_20260128_163000.png
   <img src='file:///...' width='800' alt='dashboard_home' />
```

### En Fallos
```
❌ FAILURE Screenshot captured
   Scenario: Verify Dashboard Loads
   Failed Step: Then I should see the text "QA Hub"
   Location: features/resources/screenshots/FAILED_Verify_Dashboard_Loads_20260128_163000.png
```

## Generar Reporte HTML

Para generar un reporte HTML con screenshots embebidos:

```bash
behave features/dashboard --tags=@gui -f html -o reports/gui_report.html
```

## Estructura de Screenshots

```
features/resources/screenshots/
├── dashboard_home_20260128_163000.png
├── dashboard_stats_20260128_163005.png
├── FAILED_Verify_Dashboard_20260128_163010.png
└── ...
```

## Integración con CI/CD

En tu pipeline, los screenshots se guardan automáticamente y pueden ser:
- Archivados como artifacts
- Incluidos en reportes de Jenkins/GitHub Actions
- Enviados a sistemas de almacenamiento

## Ejemplo de Configuración en GitHub Actions

```yaml
- name: Upload Screenshots
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: test-screenshots
    path: features/resources/screenshots/
```
