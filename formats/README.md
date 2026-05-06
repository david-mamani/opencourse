# 📚 OpenCourse — Formatos y Estructura

## Estructura Recomendada de un Curso

```
📁 MI COURSES DIR/               ← Esta es la carpeta que seleccionas al iniciar
│
├── 📁 01 - Nombre del Curso/    ← Cada subcarpeta es un CURSO
│   ├── 📁 01 - Modulo 1/        ← Cada subcarpeta dentro es un MÓDULO
│   │   ├── 01 - Leccion 1.mp4   ← Archivos = LECCIONES
│   │   ├── 02 - Leccion 2.mp4
│   │   ├── 03 - Apuntes.md
│   │   ├── 04 - Evaluación.quiz.md
│   │   └── 05 - Material.pdf
│   │
│   ├── 📁 02 - Modulo 2/
│   │   ├── 01 - Tema 1.mp4
│   │   └── 02 - Tema 2.mp4
│   │
│   └── Introducción.md           ← Archivos en raíz = módulo "General"
│
├── 📁 02 - Otro Curso/
│   └── ...
│
└── 📁 Sin Numeros Tambien Funciona/
    └── ...
```

## Reglas de Detección Automática

### Nombres y Orden
- Los archivos/carpetas se **ordenan automáticamente** por prefijo numérico
- Formato: `01 - Nombre`, `01_Nombre`, `01.Nombre`, `1-nombre`
- Si no hay número, se ordena alfabéticamente (posición 9999)
- Los nombres se **limpian automáticamente**: `01_mi-leccion` → `Mi Leccion`

### Tipos de Archivo Soportados

| Tipo     | Extensiones                           | Ícono en TUI |
|----------|---------------------------------------|--------------|
| Video    | `.mp4` `.mkv` `.avi` `.webm` `.mov` `.m4v` | VIDEO   |
| PDF      | `.pdf`                                | PDF          |
| Texto/MD | `.md`                                 | TEXT         |
| Quiz     | `.quiz.md`                            | QUIZ         |
| Web      | `.html` `.htm`                        | WEB          |
| Office   | `.docx` `.pptx` `.xlsx` `.doc` `.ppt` `.xls` | OFFICE |
| Tarea    | Carpeta con subcarpeta `entrega/`     | TASK         |
| Otro     | Cualquier otro archivo                | FILE         |

### Carpetas Ignoradas
`.git`, `node_modules`, `__pycache__`, `assets`, `.DS_Store`, `course.json`, `.progress.json`

## Archivos de Formato

Revisa los archivos de ejemplo en esta carpeta:

| Archivo                          | Descripción                       |
|----------------------------------|-----------------------------------|
| `ejemplo-leccion.md`             | Lección de texto Markdown         |
| `ejemplo-cuestionario.quiz.md`   | Cuestionario interactivo          |
| `ejemplo-estructura-simple/`     | Curso simple (solo videos)        |
| `ejemplo-estructura-completa/`   | Curso con todos los tipos         |
