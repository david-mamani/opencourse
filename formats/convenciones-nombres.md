# Convenciones de Nombres

## Prefijos Numéricos (para ordenar)

OpenCourse ordena automáticamente por prefijo numérico.
Estos formatos son válidos:

```
✅ 01 - Nombre de la lección.mp4
✅ 01_nombre_leccion.mp4
✅ 01.Nombre.mp4
✅ 1-nombre.mp4
✅ 001 - Nombre.mp4

❌ Nombre de la lección.mp4    ← Sin número = posición 9999 (al final)
```

## Limpieza Automática de Nombres

OpenCourse limpia los nombres para mostrarlos bonitos:

| Nombre de archivo                    | Se muestra como           |
|--------------------------------------|---------------------------|
| `01 - mi_primera_leccion.mp4`        | Mi Primera Leccion        |
| `02_conceptos-basicos.mp4`           | Conceptos Basicos         |
| `03.introducción al tema.mp4`        | Introducción Al Tema      |
| `TODO 04 - pendiente.mp4`            | Pendiente                 |
| `05 - evaluación.quiz.md`            | Evaluación                |

### Reglas:
1. Se remueve el prefijo numérico
2. Se remueve el prefijo `TODO`
3. Se reemplazan `_` y `-` por espacios
4. Se capitaliza la primera letra de cada palabra
5. Se preservan caracteres acentuados (á, é, í, ó, ú, ñ)
6. Se remueve la extensión del archivo

## Carpetas = Módulos

Las carpetas de primer nivel dentro del curso son **módulos**.
Se aplican las mismas reglas de limpieza:

```
📁 01 - fundamentos_bim/     → Módulo: "Fundamentos Bim"
📁 02 - modelado-revit/      → Módulo: "Modelado Revit"
📁 03_coordinación/           → Módulo: "Coordinación"
```

## Tareas (Tasks)

Para crear una lección tipo TAREA, crea una carpeta que contenga
una subcarpeta llamada exactamente `entrega/`:

```
📁 Proyecto Final/
└── 📁 entrega/          ← Esta subcarpeta la convierte en TASK
    └── (aquí van los archivos entregados)
```
