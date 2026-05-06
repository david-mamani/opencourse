# Introducción a BIM

## ¿Qué es BIM?

**Building Information Modeling** (BIM) es una metodología de trabajo colaborativa
para la creación y gestión de un proyecto de construcción.

Su objetivo es centralizar toda la información del proyecto en un **modelo digital**
creado por todos sus agentes.

## Ventajas

- 📐 Visualización 3D completa
- 🔄 Detección de interferencias
- 📊 Mediciones automáticas
- 🤝 Colaboración multidisciplinaria

## Niveles de Madurez

| Nivel | Descripción                  | Ejemplo              |
|-------|------------------------------|----------------------|
| 0     | CAD 2D sin colaboración      | AutoCAD básico       |
| 1     | CAD 2D/3D con estándares     | Revit individual     |
| 2     | Modelos federados            | Navisworks           |
| 3     | Modelo integrado (iBIM)      | OpenBIM completo     |

## Código de ejemplo

```python
import ifcopenshell

model = ifcopenshell.open("edificio.ifc")
walls = model.by_type("IfcWall")
print(f"El modelo tiene {len(walls)} muros")
```

## Notas importantes

> **Tip**: Siempre usa formatos abiertos como IFC para garantizar interoperabilidad.

---

*Fin de la lección*
