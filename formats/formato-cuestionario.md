# Formato de Cuestionarios (.quiz.md)

## Reglas del Formato

1. El archivo DEBE tener extensión **`.quiz.md`** (no solo `.md`)
2. Cada pregunta empieza con `## ` (heading nivel 2)
3. Las opciones son listas con checkboxes:
   - `- [ ]` = Respuesta incorrecta
   - `- [x]` = Respuesta correcta ✅
4. Puede haber múltiples respuestas correctas
5. El texto antes de la primera pregunta es el encabezado/instrucciones

## Conteo de Preguntas

OpenCourse cuenta las preguntas automáticamente buscando líneas que empiecen con `## `.
Este conteo se muestra en la interfaz como `X questions`.

## Plantilla Mínima

```markdown
# Nombre del Examen

## Pregunta 1

- [ ] Opción A
- [x] Opción B (correcta)
- [ ] Opción C

## Pregunta 2

- [x] Opción A (correcta)
- [ ] Opción B
- [x] Opción C (también correcta)
- [ ] Opción D
```

## Plantilla con Instrucciones y Contexto

```markdown
# Evaluación Módulo 3: Coordinación BIM

> **Tiempo estimado**: 15 minutos
> **Aprobación**: 70% o más

## ¿Qué herramienta se usa para detectar interferencias?

Se refiere al proceso de revisar modelos federados.

- [ ] AutoCAD
- [ ] SketchUp
- [x] Navisworks
- [ ] Photoshop

## Selecciona todos los formatos BIM abiertos

Pueden ser más de uno.

- [x] .ifc
- [ ] .rvt
- [x] .gbxml
- [ ] .dwg
```

## Nombres de Archivo Válidos

```
✅ 05 - Evaluación.quiz.md
✅ evaluacion-modulo-1.quiz.md
✅ 03_examen_final.quiz.md
✅ Quiz parcial.quiz.md

❌ evaluacion.md          ← No tiene .quiz.md, se detecta como TEXT
❌ quiz.md                ← No tiene .quiz.md
❌ evaluacion.quiz.txt    ← Extensión incorrecta
```
