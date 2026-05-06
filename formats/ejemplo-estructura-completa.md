# Curso Completo — Todos los Tipos

Esta estructura usa todos los tipos de contenido soportados.

```
📁 BIM Manager Expert/
│
├── Bienvenida.md                           ← Módulo "General" (raíz)
├── Programa del curso.pdf
│
├── 📁 01 - Fundamentos BIM/
│   ├── 01 - Que es BIM.mp4                ← VIDEO
│   ├── 02 - Historia del BIM.mp4          ← VIDEO
│   ├── 03 - Apuntes fundamentos.md        ← TEXT (Markdown)
│   ├── 04 - Glosario BIM.pdf              ← PDF
│   ├── 05 - Evaluación.quiz.md            ← QUIZ (cuestionario)
│   └── 06 - Recursos.html                 ← WEB
│
├── 📁 02 - Modelado en Revit/
│   ├── 01 - Interfaz de Revit.mp4
│   ├── 02 - Muros y pisos.mp4
│   ├── 03 - Familias.mp4
│   ├── 04 - Práctica guiada.md
│   ├── 05 - Plantilla proyecto.pptx       ← OFFICE
│   └── 06 - Examen parcial.quiz.md
│
├── 📁 03 - Coordinación BIM/
│   ├── 01 - Clash detection.mp4
│   ├── 02 - Navisworks.mp4
│   ├── 03 - Apuntes coordinación.md
│   └── 04 - Evaluación final.quiz.md
│
└── 📁 04 - Proyecto Final/
    ├── 01 - Instrucciones.md
    ├── 📁 02 - Entrega proyecto/
    │   └── 📁 entrega/                    ← TASK (tiene subcarpeta "entrega/")
    └── 03 - Rúbrica.pdf
```

**Resultado en OpenCourse:**
- Curso: "Bim Manager Expert"
- 5 módulos (incluyendo "General")
- Videos, PDFs, Markdown, Quizzes, Office, Tasks, Web
- Progreso individual por lección
```

## Reglas Importantes

1. **Prefijos numéricos** → Determinan el orden: `01`, `02`, `03`...
2. **Extensión `.quiz.md`** → Detectada como cuestionario automáticamente
3. **Carpeta `entrega/`** → Convierte la carpeta padre en tipo TASK
4. **Archivos en raíz** → Se agrupan en módulo "General"
5. **Subcarpetas recursivas** → Los archivos dentro de sub-sub-carpetas se aplanan en el módulo
