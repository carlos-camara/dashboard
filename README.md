# QA Execution Dashboard (API BDD) — httpbin sample

Este proyecto es una *Dashboard/Framework de QA* orientado a *validar y visualizar ejecuciones de tests* (principalmente pruebas de API) utilizando *BDD con Behave* en Python.

La base de pruebas se apoya en requests para validar endpoints de forma robusta y, opcionalmente, en Selenium para validaciones UI (si se añade más adelante). El objetivo es tener un repositorio preparado para integrarse con CI (Jenkins) y evolucionar hacia una *Dashboard* que consolide resultados, tendencias y calidad de las ejecuciones.

---

## Objetivo del repositorio

- Ejecutar suites BDD (Behave) de forma estandarizada.
- Validar endpoints (GET/POST/PUT/DELETE/OPTIONS) con aserciones profesionales.
- Generar evidencias y resultados para CI (Jenkins).
- Servir como base para una futura *Dashboard de ejecuciones* (histórico, estabilidad, fallos recurrentes, etc.).

---

## Contenido

- *Features (BDD)* para validar métodos HTTP contra https://httpbin.org
- *Steps* reutilizables + *helpers* separados para escalabilidad
- *Jenkinsfile* para pipeline (instalación + ejecución)

# Requisitos

- *Python 3.10+*
- Acceso a internet para consumir https://httpbin.org
- (Opcional) *Chrome/Chromium* si se ejecutan pruebas con Selenium

---

## Instalación

### Windows (PowerShell)
```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt