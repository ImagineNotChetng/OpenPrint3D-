# OpenPrint3D - Setup Guide

> **Versión Modificada por Luis** - Esta es una versión personalizada del proyecto original [OpenPrint3D](https://github.com/OpenPrint3D/OpenPrint3D).

---

## Quick Start

### 1. Clona el Repositorio

```bash
git clone https://github.com/ImagineNotChetng/OpenPrint3D-.git
cd OpenPrint3D
```

### 2. Ejecuta la GUI (Interfaz Web)

La GUI está construida con Next.js:

```bash
cd gui
npm install
npm run dev
```

Luego abre: **http://localhost:3000**

### 3. Estructura del Proyecto

```
OpenPrint3D/
├── filament/          # Perfiles de filamentos (JSON)
├── printer/           # Perfiles de impresoras (JSON)
├── process/           # Perfiles de procesos (JSON)
├── gui/               # Interfaz web (Next.js)
├── tools/             # Herramientas de calibración y utilidad
├── profile-templates/ # Plantillas para crear perfiles
├── schema/           # Esquemas JSON Schema
└── README.md
```

---

## Cómo Usar la Web

### Explorar Perfiles

1. **Filaments** - Explora filamentos por marca y material
2. **Printers** - Explora impresoras por fabricante
3. **Processes** - Explora configuraciones de slicing
4. **Relations** - Ver relaciones entre perfiles

### Crear Perfiles

Ve a **Create** para generar nuevos perfiles JSON usando el formato estándar.

### Exportar a Slicer

Usa **Export to Slicer** para convertir perfiles al formato de tu slicer preferido:
- Cura
- PrusaSlicer
- OrcaSlicer
- Bambu Studio
- Simplify3D

---

## Herramientas de Calibración

El directorio `tools/` contiene muchas herramientas para calibración:

### Python Scripts (requieren Python 3)

| Herramienta | Descripción |
|-------------|-------------|
| `temp_tower.py` | Genera torres de temperatura para encontrar temperatura óptima |
| `retraction_calculator.py` | Calcula settings de retracción |
| `flow_rate_calibration.py` | Calibración de flow rate |
| `input_shaping_wizard.py` | Asistente para Input Shaping |
| `pressure_advance_tuner.py` | Calibración de Pressure Advance |
| `first_layer_calibration.py` | Guía de calibración de primera capa |
| `extruder_calibration.py` | Calibración completa del extrusor |
| `list_profiles.py` | Lista todos los perfiles disponibles |
| `batch_validate.py` | Valida múltiples perfiles JSON |
| `convert_profile.py` | Convierte entre formatos |

### Guías en Markdown

| Guía | Descripción |
|------|-------------|
| `bed_leveling_wizard.md` | Guía completa de nivelación de cama |
| `linear_advance_calibration_guide.md` | Calibración de Linear Advance |
| `pressure_advance_guide.md` | Guía de Pressure Advance |
| `acceleration_tuning_guide.md` | Tuning de aceleración |
| `jerk_tuning_guide.md` | Configuración de jerk |
| `pid_tuning_guide.md` | Calibración PID |
| `vibration_compensation_guide.md` | Compensación de vibraciones |
| `filament_drying_guide.md` | Cómo secar filamento |
| `print_quality_troubleshooting.md` | Solución de problemas |
| `warping_prevention_guide.md` | Prevención de warping |

### Ejecutar Herramientas Python

```bash
# Ejemplo: generar temp tower
python tools/temp_tower.py

# Ejemplo: calcular retracción
python tools/retraction_calculator.py
```

---

## Formato de Perfiles

### Perfil de Impresora (JSON)

```json
{
  "id": "bambulab_x1_carbon",
  "brand": "Bambu Lab",
  "model": "X1 Carbon",
  "technology": "FDM",
  " kinematics": "CoreXY",
  "volume": {
    "width": 256,
    "depth": 256,
    "height": 256
  },
  "nozzle": {
    "diameter": 0.4,
    "compatible": [0.2, 0.4, 0.6, 0.8]
  },
  "bed": {
    "temperature": 60,
    "materials": ["PLA", "PETG", "ABS", "ASA", "TPU"]
  }
}
```

### Perfil de Filamento (JSON)

```json
{
  "id": "pla_generic",
  "brand": "Generic",
  "material": "PLA",
  "temperatures": {
    "nozzle": 200,
    "bed": 60
  },
  "fan": {
    "min": 100,
    "max": 100
  },
  "speed": {
    "max": 200
  }
}
```

---

## Contribuir

1. Fork el repo
2. Crea una branch (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Add new feature'`)
4. Push a la branch (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

---

## Licencia

MIT License - ver LICENSE.md para detalles.

---

## Enlaces

- **Web:** https://openprint3d.github.io
- **GitHub:** https://github.com/ImagineNotChetng/OpenPrint3D-
- **Original:** https://github.com/OpenPrint3D/OpenPrint3D
