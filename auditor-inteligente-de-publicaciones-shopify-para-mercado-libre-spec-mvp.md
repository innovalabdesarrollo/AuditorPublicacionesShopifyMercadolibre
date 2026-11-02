# Auditor Inteligente de Publicaciones Shopify para Mercado Libre — Especificación MVP

> Exportado desde **Traductor Dev** · 2/11/2026, 6:46:16 p.m.

## Resumen del proyecto

| Campo | Valor |
| --- | --- |
| Estado | draft |
| Presupuesto | $0 |
| Tipo de sistema | — |
| Plazo MVP | — |

### Objetivo

## Objetivo

Desarrollar un sistema de auditoría mediante inteligencia artificial que revise las publicaciones creadas en Shopify antes de ser enviadas o sincronizadas con Mercado Libre.

El sistema deberá detectar información faltante, incorrecta, poco clara o contradictoria y verificar que cada publicación tenga la estructura e información necesarias para funcionar correctamente en Mercado Libre.

La herramienta deberá revisar de manera integral:

* Título del producto.
* Marca.
* Modelo.
* Tipo de producto.
* Descripción.
* Especificaciones técnicas.
* Compatibilidad cuando aplique.
* Medidas, capacidades, voltaje, potencia u otros datos relevantes.
* Contenido del paquete.
* Características principales.
* Imágenes.
* Coherencia entre toda la información publicada.

El objetivo es detectar y corregir problemas desde Shopify, que funciona como la fuente principal de las publicaciones, antes de que la información llegue a Mercado Libre.

Esto permitirá reducir errores, publicaciones incompletas, dudas de compradores, preguntas repetitivas, compras incorrectas, devoluciones y reclamos.

Al mismo tiempo, el sistema deberá optimizar las publicaciones para mejorar su posicionamiento y potencial de venta dentro de Mercado Libre.

## Auditoría del título

El sistema deberá verificar que el título generado en Shopify sea adecuado para utilizarse posteriormente en Mercado Libre.

Deberá comprobar que:

* No exceda los 60 caracteres.
* Identifique claramente qué producto se está vendiendo.
* Incluya marca y modelo cuando sean relevantes.
* Incluya el tipo de producto.
* Contenga palabras clave importantes utilizadas por los compradores.
* Incluya características relevantes cuando ayuden a identificar o diferenciar el producto.
* Evite palabras repetitivas o que no aporten valor.
* Sea coherente con el producto realmente publicado.

Cuando detecte oportunidades de mejora, deberá generar un título recomendado optimizado para Mercado Libre con un máximo de 60 caracteres.

## Auditoría de la descripción

La inteligencia artificial deberá revisar la descripción creada en Shopify y comprobar que corresponda exactamente con el producto de la publicación.

Deberá verificar que:

* Marca y modelo sean correctos.
* Las especificaciones coincidan con el producto.
* La compatibilidad esté claramente indicada cuando sea necesaria.
* Las dimensiones, capacidades, voltaje, potencia y demás características sean correctas.
* El contenido del paquete esté claramente definido.
* No aparezcan características de otro modelo o variante.
* No existan datos contradictorios.
* No se mencionen accesorios que no estén incluidos.
* La información sea suficientemente clara para que el comprador comprenda exactamente qué producto está adquiriendo.

También deberá comparar la información existente entre:

**Título + descripción + especificaciones + imágenes + datos del producto**

para detectar contradicciones.

Por ejemplo:

* El título indica un modelo y la descripción otro.
* Una imagen corresponde a una versión diferente.
* La descripción menciona una capacidad distinta.
* Se indica una compatibilidad que no corresponde.
* El voltaje cambia entre diferentes secciones.
* Se menciona un accesorio que no aparece incluido en el producto.
* Se utiliza información copiada de otra variante.

## Identificación de información faltante

El sistema deberá determinar qué información debería contener una publicación dependiendo del tipo de producto.

Por ejemplo:

Para productos electrónicos:

* Modelo.
* Voltaje.
* Potencia.
* Tipo de conexión.
* Compatibilidad.
* Dimensiones.

Para autopartes:

* Marca.
* Modelo.
* Año o rango de años compatibles.
* Vehículos compatibles.
* Número de parte cuando aplique.

Para accesorios tecnológicos:

* Dispositivos compatibles.
* Tipo de conexión.
* Tamaño.
* Versión.
* Contenido del paquete.

La inteligencia artificial deberá adaptar la auditoría dependiendo de la categoría del producto.

## Prevención de preguntas de clientes

Uno de los objetivos del sistema será detectar información poco clara que pueda provocar preguntas de compradores.

La IA deberá identificar preguntas potenciales como:

* ¿Es compatible con mi vehículo?
* ¿Qué modelo exacto es?
* ¿Qué medidas tiene?
* ¿Incluye cargador?
* ¿Incluye batería?
* ¿Es 110 V o 220 V?
* ¿Qué accesorios incluye?
* ¿Funciona con determinado dispositivo?
* ¿Qué versión es?
* ¿Cuál es la capacidad?

Cuando detecte una posible pregunta, deberá indicar qué información debe agregarse o aclararse en la publicación para evitar que el comprador tenga que realizarla.

## Reporte de auditoría

Cada publicación de Shopify deberá recibir un reporte que incluya:

### 1. Calificación general

Puntuación de calidad de **0 a 100**.

### 2. Estado de la publicación

* Lista para Mercado Libre.
* Requiere mejoras.
* Requiere correcciones importantes.

### 3. Errores encontrados

Listado de problemas detectados.

### 4. Información faltante

Datos que deberían agregarse dependiendo del producto.

### 5. Inconsistencias

Contradicciones entre título, descripción, especificaciones e imágenes.

### 6. Título actual

Título registrado actualmente en Shopify.

### 7. Título recomendado para Mercado Libre

Propuesta optimizada de máximo 60 caracteres.

### 8. Revisión de descripción

Elementos que deben corregirse, eliminarse, aclararse o agregarse.

### 9. Preguntas potenciales del comprador

Dudas que probablemente surgirían debido a información incompleta.

### 10. Recomendaciones de optimización

Cambios que pueden mejorar claridad, posicionamiento y conversión.

### Propuesta de solución

Propuesta final del proyecto

Crear una herramienta de inteligencia artificial que funcione como un control de calidad de las publicaciones de Shopify antes de que sean enviadas a Mercado Libre.

El sistema analizará cada producto de Shopify, auditará toda su información y determinará si la publicación está suficientemente completa y optimizada para Mercado Libre.

El flujo sería:

Producto creado en Shopify → Auditoría con IA → revisión de título, descripción, marca, modelo, especificaciones, compatibilidad e imágenes → detección de errores y datos faltantes → generación de recomendaciones → propuesta de título optimizado → calificación de la publicación → corrección en Shopify → publicación o sincronización con Mercado Libre.

Resultado esperado

Establecer un sistema de control de calidad que permita detectar los problemas desde Shopify, antes de que lleguen a Mercado Libre.

Esto permitirá que las publicaciones que se envíen a Mercado Libre sean más completas, claras, consistentes y optimizadas.

El objetivo final es:

Reducir errores en publicaciones.
Reducir preguntas de clientes.
Reducir compras equivocadas.
Reducir devoluciones y reclamos ocasionados por información incorrecta o insuficiente.
Mejorar la calidad general del catálogo.
Mejorar el posicionamiento dentro de Mercado Libre.
Facilitar que los compradores encuentren el producto correcto.
Incrementar la conversión y las ventas.

## Actores del sistema (2)

### Responsable de catálogo y publicaciones

Usuario que consulta los reportes de auditoría, revisa errores y recomendaciones, corrige la información de los productos en Shopify y decide si una publicación está lista para sincronizarse con Mercado Libre.

### Motor de auditoría con IA

Componente del sistema que analiza la información del producto, detecta faltantes e inconsistencias, genera recomendaciones, propone títulos optimizados y calcula la calificación de calidad.

## Historias de usuario (23)

### Analizar la información completa del producto

- **Rol:** Motor de auditoría con IA
- **Prioridad:** Crítica
- **Formato:** Como **Motor de auditoría con IA**, quiero **procesar el título, descripción, marca, modelo, categoría, especificaciones, variantes, contenido del paquete e imágenes de cada producto** para **pueda evaluar la calidad integral de la publicación antes de sincronizarla con Mercado Libre**.

**Criterios de aceptación:**

- El motor recibe los datos disponibles del producto, identifica los campos presentes y ausentes, y genera un resultado de auditoría asociado al identificador del producto.

### Validar los requisitos según la categoría

- **Rol:** Motor de auditoría con IA
- **Prioridad:** Alta
- **Formato:** Como **Motor de auditoría con IA**, quiero **aplicar reglas y campos obligatorios específicos para la categoría del producto** para **pueda detectar faltantes relevantes según el tipo de artículo auditado**.

**Criterios de aceptación:**

- La auditoría utiliza la categoría del producto para determinar los atributos esperados y reporta como faltantes aquellos datos relevantes que no estén informados.

### Detectar inconsistencias entre los datos publicados

- **Rol:** Motor de auditoría con IA
- **Prioridad:** Crítica
- **Formato:** Como **Motor de auditoría con IA**, quiero **comparar el título, la descripción, las especificaciones, las variantes y las imágenes** para **pueda identificar contradicciones o información copiada de otro producto o modelo**.

**Criterios de aceptación:**

- El reporte identifica el origen de cada inconsistencia, describe el conflicto detectado y señala los campos involucrados; como mínimo debe validar modelo, capacidad, voltaje, compatibilidad y contenido del paquete cuando estén disponibles.

### Auditar y optimizar el título

- **Rol:** Motor de auditoría con IA
- **Prioridad:** Alta
- **Formato:** Como **Motor de auditoría con IA**, quiero **validar que el título sea claro, relevante, coherente y tenga como máximo 60 caracteres** para **pueda proponer un título adecuado para Mercado Libre y mejorar la identificación del producto**.

**Criterios de aceptación:**

- El motor informa la cantidad de caracteres, detecta repeticiones o datos faltantes relevantes y genera una propuesta de título de hasta 60 caracteres sin agregar atributos que no estén respaldados por la información del producto.

### Revisar la descripción del producto

- **Rol:** Motor de auditoría con IA
- **Prioridad:** Alta
- **Formato:** Como **Motor de auditoría con IA**, quiero **analizar si la descripción es exacta, clara y suficiente para el producto auditado** para **pueda detectar afirmaciones incorrectas, ambiguas, contradictorias o correspondientes a otra variante**.

**Criterios de aceptación:**

- El resultado separa los fragmentos que deben corregirse, eliminarse, aclararse o agregarse, y verifica la coherencia de marca, modelo, especificaciones, compatibilidad y accesorios incluidos.

### Identificar información faltante y preguntas potenciales

- **Rol:** Motor de auditoría con IA
- **Prioridad:** Alta
- **Formato:** Como **Motor de auditoría con IA**, quiero **detectar datos cuya ausencia pueda generar dudas o compras incorrectas** para **pueda recomendar aclaraciones que reduzcan preguntas, devoluciones y reclamos**.

**Criterios de aceptación:**

- El reporte lista cada dato faltante, explica por qué es relevante y genera preguntas potenciales del comprador relacionadas con compatibilidad, medidas, voltaje, capacidad, versiones o contenido del paquete cuando corresponda.

### Calcular la calificación de calidad

- **Rol:** Motor de auditoría con IA
- **Prioridad:** Crítica
- **Formato:** Como **Motor de auditoría con IA**, quiero **asignar una puntuación de calidad de 0 a 100 basada en los hallazgos de la auditoría** para **pueda clasificar objetivamente el estado de la publicación**.

**Criterios de aceptación:**

- La puntuación se genera de forma consistente a partir de completitud, coherencia, claridad y optimización; además, el motor asigna uno de los estados: lista para Mercado Libre, requiere mejoras o requiere correcciones importantes.

### Priorizar los problemas detectados

- **Rol:** Motor de auditoría con IA
- **Prioridad:** Alta
- **Formato:** Como **Motor de auditoría con IA**, quiero **clasificar cada hallazgo por severidad y ordenarlo según su impacto** para **pueda facilitar la corrección de los problemas más importantes antes de la sincronización**.

**Criterios de aceptación:**

- Cada error, faltante o inconsistencia incluye una descripción, el campo afectado, una prioridad entre baja, media, alta o crítica y una recomendación concreta de corrección.

### Generar el reporte de auditoría

- **Rol:** Motor de auditoría con IA
- **Prioridad:** Crítica
- **Formato:** Como **Motor de auditoría con IA**, quiero **consolidar la calificación, el estado, los errores, faltantes, inconsistencias, títulos y recomendaciones en un reporte estructurado** para **pueda entregar un resultado completo y utilizable por el resto del sistema**.

**Criterios de aceptación:**

- El reporte contiene como mínimo la puntuación, el estado, los errores encontrados, la información faltante, las inconsistencias, el título actual, el título recomendado, la revisión de la descripción, las preguntas potenciales y las recomendaciones de optimización.

### Proponer mejoras de posicionamiento y conversión

- **Rol:** Motor de auditoría con IA
- **Prioridad:** Media
- **Formato:** Como **Motor de auditoría con IA**, quiero **generar recomendaciones accionables para mejorar claridad, relevancia y potencial de venta de la publicación** para **pueda optimizar el contenido sin modificarlo automáticamente de forma no autorizada**.

**Criterios de aceptación:**

- Las recomendaciones están vinculadas a un hallazgo o atributo concreto, distinguen entre mejoras de contenido y correcciones obligatorias, y no inventan información que no esté presente en los datos del producto.

### Controlar la confiabilidad de las recomendaciones

- **Rol:** Motor de auditoría con IA
- **Prioridad:** Media
- **Formato:** Como **Motor de auditoría con IA**, quiero **indicar el nivel de confianza y la evidencia utilizada para cada hallazgo o propuesta** para **pueda diferenciar entre correcciones confirmadas y sugerencias que requieren revisión humana**.

**Criterios de aceptación:**

- Cada resultado generado por IA incluye, cuando sea posible, su nivel de confianza y los campos o evidencias que lo sustentan; los hallazgos de baja confianza quedan marcados para revisión.

### Consultar publicaciones auditadas

- **Rol:** Responsable de catálogo y publicaciones
- **Prioridad:** Alta
- **Formato:** Como **Responsable de catálogo y publicaciones**, quiero **ver un listado de las publicaciones de Shopify con su calificación, estado de auditoría y fecha de revisión** para **pueda identificar rápidamente cuáles requieren atención antes de sincronizarlas con Mercado Libre**.

**Criterios de aceptación:**

- El listado muestra producto, SKU, calificación de 0 a 100, estado, fecha de auditoría y cantidad de errores. Permite ordenar y filtrar por estado y calificación.

### Revisar el detalle del reporte de auditoría

- **Rol:** Responsable de catálogo y publicaciones
- **Prioridad:** Alta
- **Formato:** Como **Responsable de catálogo y publicaciones**, quiero **consultar el reporte completo de una publicación** para **pueda comprender los problemas que deben corregirse antes de aprobarla**.

**Criterios de aceptación:**

- El reporte presenta calificación, estado, errores, información faltante, inconsistencias, título actual, título recomendado, revisión de descripción, preguntas potenciales y recomendaciones de optimización.

### Distinguir la severidad de los hallazgos

- **Rol:** Responsable de catálogo y publicaciones
- **Prioridad:** Alta
- **Formato:** Como **Responsable de catálogo y publicaciones**, quiero **identificar si cada hallazgo es crítico, importante o informativo** para **pueda priorizar las correcciones que impiden o ponen en riesgo la sincronización**.

**Criterios de aceptación:**

- Cada hallazgo incluye una descripción clara, el dato afectado y un nivel de severidad. Los errores críticos se diferencian visualmente de las recomendaciones.

### Comparar la información de la publicación

- **Rol:** Responsable de catálogo y publicaciones
- **Prioridad:** Alta
- **Formato:** Como **Responsable de catálogo y publicaciones**, quiero **comparar el título, descripción, especificaciones, imágenes y datos del producto señalados por la auditoría** para **pueda localizar rápidamente el origen de una inconsistencia**.

**Criterios de aceptación:**

- La vista de detalle permite consultar los valores involucrados en cada contradicción y muestra qué campos o elementos no coinciden.

### Aplicar correcciones en Shopify

- **Rol:** Responsable de catálogo y publicaciones
- **Prioridad:** Alta
- **Formato:** Como **Responsable de catálogo y publicaciones**, quiero **acceder a la edición del producto en Shopify desde el reporte de auditoría** para **pueda corregir la información faltante o incorrecta sin buscar manualmente la publicación**.

**Criterios de aceptación:**

- El reporte incluye un acceso al producto correspondiente en Shopify. La publicación se identifica mediante un identificador o SKU y, al regresar, permite solicitar una nueva auditoría.

### Solicitar una nueva auditoría

- **Rol:** Responsable de catálogo y publicaciones
- **Prioridad:** Alta
- **Formato:** Como **Responsable de catálogo y publicaciones**, quiero **volver a auditar una publicación después de corregirla en Shopify** para **pueda verificar si los errores fueron solucionados antes de sincronizarla**.

**Criterios de aceptación:**

- Existe una acción para iniciar una nueva auditoría. El sistema registra el estado de procesamiento y muestra el reporte actualizado cuando finaliza.

### Aprobar una publicación para sincronización

- **Rol:** Responsable de catálogo y publicaciones
- **Prioridad:** Crítica
- **Formato:** Como **Responsable de catálogo y publicaciones**, quiero **marcar una publicación como lista para sincronizar con Mercado Libre cuando cumpla los criterios definidos** para **pueda controlar qué productos están autorizados para avanzar en el flujo de publicación**.

**Criterios de aceptación:**

- La aprobación requiere que no existan errores críticos pendientes. Se registra el usuario y la fecha de aprobación, y la publicación queda identificada como lista para sincronización.

### Impedir la aprobación de publicaciones con errores críticos

- **Rol:** Responsable de catálogo y publicaciones
- **Prioridad:** Crítica
- **Formato:** Como **Responsable de catálogo y publicaciones**, quiero **recibir una advertencia y no poder aprobar publicaciones con problemas críticos sin resolver** para **pueda evitar que información incorrecta o incompleta llegue a Mercado Libre**.

**Criterios de aceptación:**

- Si existen errores críticos, la acción de aprobación permanece bloqueada o solicita una confirmación excepcional con justificación. El sistema muestra los errores pendientes.

### Usar el título recomendado

- **Rol:** Responsable de catálogo y publicaciones
- **Prioridad:** Alta
- **Formato:** Como **Responsable de catálogo y publicaciones**, quiero **copiar o aplicar el título recomendado por la auditoría en la publicación de Shopify** para **pueda corregir rápidamente el título y mejorar su adecuación para Mercado Libre**.

**Criterios de aceptación:**

- El título recomendado se muestra completo, no supera los 60 caracteres y ofrece una acción para copiarlo o enviarlo al campo correspondiente de Shopify.

### Registrar el seguimiento de correcciones

- **Rol:** Responsable de catálogo y publicaciones
- **Prioridad:** Media
- **Formato:** Como **Responsable de catálogo y publicaciones**, quiero **consultar qué problemas fueron corregidos entre auditorías** para **pueda dar seguimiento al avance de la calidad de cada publicación**.

**Criterios de aceptación:**

- El sistema conserva el estado y la fecha de cada auditoría, la calificación obtenida y los hallazgos que dejaron de aparecer después de una nueva revisión.

### Filtrar publicaciones pendientes de corrección

- **Rol:** Responsable de catálogo y publicaciones
- **Prioridad:** Media
- **Formato:** Como **Responsable de catálogo y publicaciones**, quiero **filtrar las publicaciones que requieren mejoras o correcciones importantes** para **pueda organizar mi trabajo y atender primero los productos con mayor riesgo**.

**Criterios de aceptación:**

- Los filtros incluyen al menos estado, rango de calificación, severidad de errores y categoría o producto. Los resultados pueden abrirse directamente en el reporte de auditoría.

### Consultar recomendaciones de optimización

- **Rol:** Responsable de catálogo y publicaciones
- **Prioridad:** Media
- **Formato:** Como **Responsable de catálogo y publicaciones**, quiero **ver recomendaciones ordenadas por impacto para cada publicación** para **pueda mejorar la claridad, el posicionamiento y la conversión del producto**.

**Criterios de aceptación:**

- Las recomendaciones indican el cambio sugerido, el campo afectado y su prioridad o impacto estimado, diferenciando correcciones obligatorias de mejoras opcionales.

## Casos de uso (11)

### Consultar estado de publicaciones auditadas

- **Rol:** Responsable de catálogo y publicaciones
- **Prioridad:** Media

Permitir al responsable consultar y filtrar las publicaciones de Shopify según su calificación, estado y necesidad de corrección.

**Pasos:**

1. El responsable solicita el listado de publicaciones auditadas.
2. El sistema muestra cada publicación con su calificación, estado de auditoría y fecha de revisión.
3. El responsable aplica filtros por estado, incluyendo publicaciones que requieren mejoras o correcciones importantes.
4. El sistema actualiza el listado mostrando únicamente las publicaciones que cumplen los criterios seleccionados.
5. El responsable selecciona una publicación para acceder a su reporte.

### Analizar reporte de auditoría de publicación

- **Rol:** Responsable de catálogo y publicaciones
- **Prioridad:** Media

Permitir revisar el reporte completo de una publicación, comprender la severidad de sus hallazgos, comparar la información auditada y consultar recomendaciones de optimización.

**Pasos:**

1. El responsable selecciona una publicación auditada.
2. El sistema muestra la calificación general, el estado y el listado completo de hallazgos.
3. El sistema identifica cada hallazgo con su severidad: crítico, importante o informativo.
4. El responsable consulta la comparación entre título, descripción, especificaciones, imágenes y datos del producto.
5. El sistema resalta las diferencias, contradicciones e información faltante detectadas.
6. El responsable consulta las recomendaciones de optimización ordenadas por impacto.
7. El sistema presenta las recomendaciones aplicables a la publicación.

### Aplicar correcciones en publicación Shopify

- **Rol:** Responsable de catálogo y publicaciones
- **Prioridad:** Media

Permitir acceder a la edición del producto en Shopify y aplicar el título recomendado por la auditoría para corregir la publicación.

**Pasos:**

1. El responsable abre el reporte de auditoría de una publicación.
2. El responsable selecciona la opción para editar el producto en Shopify.
3. El sistema redirige al responsable a la pantalla de edición correspondiente en Shopify.
4. El responsable consulta el título recomendado por la auditoría.
5. El responsable copia o aplica el título recomendado en Shopify.
6. El sistema confirma la acción o informa si el título no pudo aplicarse.
7. El responsable guarda las demás correcciones necesarias en Shopify.

### Solicitar nueva auditoría de publicación

- **Rol:** Responsable de catálogo y publicaciones
- **Prioridad:** Media

Permitir volver a auditar una publicación después de que sus datos hayan sido corregidos en Shopify.

**Pasos:**

1. El responsable accede al reporte de una publicación corregida.
2. El responsable solicita una nueva auditoría.
3. El sistema verifica que la publicación esté disponible y actualizada en Shopify.
4. El sistema inicia una nueva auditoría utilizando la información vigente del producto.
5. El sistema genera un nuevo reporte con la calificación, estado, hallazgos e inconsistencias actuales.
6. El sistema conserva la referencia a la auditoría anterior para permitir el seguimiento de cambios.

### Consultar seguimiento de correcciones

- **Rol:** Responsable de catálogo y publicaciones
- **Prioridad:** Media

Permitir identificar los problemas corregidos, pendientes o modificados entre las distintas auditorías de una publicación.

**Pasos:**

1. El responsable abre el historial de auditorías de una publicación.
2. El sistema muestra las auditorías disponibles ordenadas por fecha.
3. El responsable selecciona dos auditorías para comparar.
4. El sistema identifica los hallazgos corregidos, los que permanecen pendientes y los nuevos problemas detectados.
5. El sistema muestra la evolución de la calificación y del estado de la publicación.
6. El responsable consulta el detalle de cada cambio.

### Aprobar publicación para sincronización

- **Rol:** Responsable de catálogo y publicaciones
- **Prioridad:** Media

Permitir marcar una publicación como lista para sincronizar con Mercado Libre únicamente cuando cumpla los criterios de calidad definidos y no tenga errores críticos sin resolver.

**Pasos:**

1. El responsable abre el reporte de auditoría vigente de una publicación.
2. El responsable solicita aprobar la publicación para sincronización.
3. El sistema verifica el estado de la auditoría y la existencia de hallazgos críticos pendientes.
4. Si existen errores críticos, el sistema muestra una advertencia con su detalle e impide la aprobación.
5. Si no existen errores críticos y se cumplen los criterios definidos, el sistema solicita confirmación.
6. El responsable confirma la aprobación.
7. El sistema marca la publicación como lista para sincronizar con Mercado Libre y registra la fecha y el responsable de la acción.

### Ejecutar auditoría integral de publicación

- **Rol:** Motor de auditoría con IA
- **Prioridad:** Media

Analizar la información completa de una publicación de Shopify y verificar su coherencia, exactitud, claridad y cumplimiento según el producto y su categoría.

**Pasos:**

1. El motor recibe el título, descripción, marca, modelo, categoría, especificaciones, variantes, contenido del paquete e imágenes de la publicación.
2. El sistema identifica el tipo de producto y selecciona las reglas de auditoría correspondientes.
3. El sistema valida los campos obligatorios y las características esperadas para la categoría.
4. El sistema analiza el título y verifica su longitud máxima de 60 caracteres, claridad, relevancia, palabras clave, marca, modelo y tipo de producto.
5. El sistema revisa la descripción y comprueba la exactitud de sus datos, compatibilidades, medidas, capacidades, accesorios y especificaciones.
6. El sistema compara título, descripción, especificaciones, variantes, datos del producto e imágenes.
7. El sistema registra errores, omisiones, contradicciones y posibles datos correspondientes a otra variante.
8. El sistema devuelve los hallazgos estructurados de la auditoría.

### Identificar brechas de información

- **Rol:** Motor de auditoría con IA
- **Prioridad:** Media

Detectar información faltante o poco clara que pueda provocar preguntas de compradores, compras incorrectas, devoluciones o reclamos.

**Pasos:**

1. El motor recibe los datos disponibles y los hallazgos de la auditoría de la publicación.
2. El sistema determina los atributos necesarios según la categoría, producto y variante.
3. El sistema identifica campos obligatorios o relevantes que no fueron informados o presentan ambigüedad.
4. El sistema analiza las posibles dudas del comprador derivadas de cada ausencia o falta de claridad.
5. El sistema genera preguntas potenciales, como compatibilidad, medidas, voltaje, capacidad o contenido del paquete.
6. El sistema vincula cada pregunta con la información que debe agregarse o aclararse.
7. El sistema devuelve las brechas de información y las preguntas potenciales priorizadas.

### Calcular calidad de publicación

- **Rol:** Motor de auditoría con IA
- **Prioridad:** Media

Asignar una calificación objetiva y un estado general a la publicación a partir de la gravedad e impacto de los hallazgos detectados.

**Pasos:**

1. El motor recibe todos los hallazgos, brechas, inconsistencias y resultados de validación.
2. El sistema clasifica cada problema según su severidad e impacto en la comprensión, publicación o venta del producto.
3. El sistema prioriza los problemas desde los más críticos hasta los de menor impacto.
4. El sistema aplica las reglas de evaluación para calcular una puntuación entre 0 y 100.
5. El sistema determina el estado de la publicación: lista para Mercado Libre, requiere mejoras o requiere correcciones importantes.
6. El sistema devuelve la puntuación, el estado y el orden de prioridad de los problemas.

### Generar recomendaciones de publicación

- **Rol:** Motor de auditoría con IA
- **Prioridad:** Media

Proponer cambios accionables para mejorar la claridad, relevancia, posicionamiento y potencial de conversión de la publicación.

**Pasos:**

1. El motor recibe el contenido auditado y los hallazgos priorizados.
2. El sistema identifica oportunidades de mejora en título, descripción, especificaciones, imágenes y atributos del producto.
3. El sistema genera un título recomendado coherente con el producto y de hasta 60 caracteres.
4. El sistema propone ajustes para eliminar ambigüedades, corregir contradicciones y completar información relevante.
5. El sistema genera recomendaciones de posicionamiento y conversión basadas en la categoría y las características del producto.
6. El sistema devuelve las propuestas vinculadas con los problemas u oportunidades que las originaron.

### Emitir reporte de auditoría

- **Rol:** Motor de auditoría con IA
- **Prioridad:** Media

Consolidar los resultados de la auditoría en un reporte completo, trazable y utilizable para corregir la publicación antes de sincronizarla con Mercado Libre.

**Pasos:**

1. El motor recibe los resultados de validación, análisis, puntuación, priorización y recomendaciones.
2. El sistema consolida la calificación general y el estado de la publicación.
3. El sistema incorpora los errores, la información faltante, las inconsistencias y las preguntas potenciales.
4. El sistema incluye el título actual, el título recomendado y la revisión de la descripción.
5. El sistema agrega las recomendaciones de optimización y sus prioridades.
6. El sistema muestra para cada hallazgo o propuesta su nivel de confianza y la evidencia utilizada.
7. El sistema genera y entrega el reporte de auditoría asociado a la publicación.

## Modelo de datos (7 objetos)

### Publicación

Representa el producto administrado en Shopify que será evaluado y eventualmente sincronizado con Mercado Libre.

| Campo | Tipo | PK | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| id | uuid | Sí | Sí | Identificador único de la publicación. |
| shopifyProductId | text | — | Sí | Identificador del producto en Shopify. |
| title | text | — | Sí | Título actual de la publicación. |
| description | textarea | — | Sí | Descripción completa del producto. |
| productCategory | text | — | Sí | Categoría o tipo de producto utilizado para adaptar la auditoría. |
| publicationStatus | text | — | Sí | Estado de la publicación dentro del flujo de auditoría y sincronización. |
| approvedForSync | boolean | — | Sí | Indica si la publicación fue aprobada para sincronizarse con Mercado Libre. |
| updatedAt | datetime | — | Sí | Fecha y hora de la última actualización de la publicación. |

### Auditoría

Representa una ejecución de revisión integral de una publicación y sus resultados de calidad, cumplimiento y optimización.

| Campo | Tipo | PK | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| id | uuid | Sí | Sí | Identificador único de la auditoría. |
| publicationId | uuid | — | Sí | Identificador de la publicación auditada. |
| qualityScore | number | — | Sí | Puntuación general de calidad entre 0 y 100. |
| auditStatus | text | — | Sí | Resultado general de la auditoría, como lista, requiere mejoras o correcciones importantes. |
| recommendedTitle | text | — | — | Título optimizado recomendado para Mercado Libre. |
| missingInformation | textarea | — | — | Información faltante identificada según la categoría del producto. |
| potentialBuyerQuestions | textarea | — | — | Preguntas que podrían surgir por información incompleta o poco clara. |
| auditedAt | datetime | — | Sí | Fecha y hora de ejecución de la auditoría. |

### Hallazgo

Representa un problema, omisión, contradicción o riesgo detectado durante la auditoría de una publicación.

| Campo | Tipo | PK | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| id | uuid | Sí | Sí | Identificador único del hallazgo. |
| auditId | uuid | — | Sí | Identificador de la auditoría que originó el hallazgo. |
| findingType | text | — | Sí | Tipo de problema detectado, como error, omisión, inconsistencia o riesgo. |
| severity | text | — | Sí | Nivel de severidad del hallazgo. |
| title | text | — | Sí | Resumen breve del problema detectado. |
| description | textarea | — | Sí | Detalle del problema y la evidencia encontrada. |
| suggestedAction | textarea | — | — | Corrección o acción recomendada para resolver el hallazgo. |
| isResolved | boolean | — | Sí | Indica si el hallazgo fue corregido o atendido. |

### Criterio de auditoría

Representa una regla o requisito utilizado para validar una publicación según su categoría y destino de comercialización.

| Campo | Tipo | PK | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| id | uuid | Sí | Sí | Identificador único del criterio de auditoría. |
| name | text | — | Sí | Nombre descriptivo del requisito o regla. |
| description | textarea | — | Sí | Descripción detallada de lo que debe validarse. |
| category | text | — | Sí | Categoría de producto a la que aplica el criterio. |
| destination | text | — | Sí | Destino o canal de comercialización donde se aplica el criterio. |
| validationRule | textarea | — | Sí | Regla utilizada por el motor de auditoría para validar la publicación. |
| isActive | boolean | — | Sí | Indica si el criterio está habilitado para nuevas auditorías. |

### Recomendación

Representa una propuesta generada para corregir, completar, aclarar u optimizar una publicación.

| Campo | Tipo | PK | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| id | uuid | Sí | Sí | Identificador único de la recomendación. |
| recommendationType | text | — | Sí | Tipo de recomendación, como corrección, completitud, claridad u optimización. |
| description | textarea | — | Sí | Propuesta detallada para mejorar la publicación. |
| suggestedValue | textarea | — | — | Texto o valor sugerido para aplicar en la publicación. |
| priority | number | — | Sí | Prioridad de implementación de la recomendación. |
| confidenceScore | decimal | — | — | Nivel de confianza de la inteligencia artificial en la recomendación. |
| status | text | — | Sí | Estado de la recomendación, por ejemplo pendiente, aceptada, aplicada o descartada. |

### Corrección

Representa una modificación aplicada o pendiente para resolver hallazgos y mejorar una publicación en Shopify.

| Campo | Tipo | PK | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| id | uuid | Sí | Sí | Identificador único de la corrección. |
| description | textarea | — | Sí | Descripción de la modificación necesaria o aplicada. |
| fieldName | text | — | Sí | Campo de la publicación Shopify que debe modificarse. |
| previousValue | textarea | — | — | Valor existente antes de aplicar la corrección. |
| correctedValue | textarea | — | — | Valor propuesto o aplicado para resolver el hallazgo. |
| status | text | — | Sí | Estado de la corrección, por ejemplo pendiente, aplicada, rechazada o verificada. |
| appliedAt | datetime | — | — | Fecha y hora en que se aplicó la corrección. |

### Aprobación de sincronización

Representa la decisión de autorizar o impedir que una publicación corregida sea enviada o sincronizada con Mercado Libre.

| Campo | Tipo | PK | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| id | uuid | Sí | Sí | Identificador único de la aprobación de sincronización. |
| publicationId | uuid | — | Sí | Identificador de la publicación auditada cuya sincronización se evalúa. |
| status | text | — | Sí | Estado de la decisión: pendiente, aprobada, rechazada o bloqueada. |
| decisionReason | textarea | — | — | Motivo de la aprobación, rechazo o bloqueo, incluyendo errores críticos relevantes. |
| approvedBy | text | — | — | Responsable de catálogo o publicaciones que tomó la decisión. |
| decidedAt | datetime | — | — | Fecha y hora en que se registró la decisión de sincronización. |

### Relaciones

- **Publicación** → **Auditoría** (one-to-many): es evaluada mediante
- **Auditoría** → **Hallazgo** (one-to-many): detecta
- **Auditoría** → **Criterio de auditoría** (many-to-many): aplica
- **Criterio de auditoría** → **Hallazgo** (one-to-many): fundamenta
- **Hallazgo** → **Recomendación** (one-to-many): genera
- **Hallazgo** → **Corrección** (one-to-many): se resuelve mediante
- **Publicación** → **Corrección** (one-to-many): recibe
- **Recomendación** → **Corrección** (one-to-many): se implementa mediante
- **Publicación** → **Aprobación de sincronización** (one-to-many): requiere

## Épicas (2)

### Responsable de catálogo y publicaciones

- **Estado:** Abierta
- **Prioridad:** Media

Implementar capacidades para el rol Responsable de catálogo y publicaciones.

**Tickets (13):** Backend: Consultar estado de publicaciones auditadas; Backend: Analizar reporte de auditoría de publicación; Backend: Solicitar nueva auditoría de publicación; Backend: Aplicar correcciones en publicación Shopify; Implementar: Solicitar una nueva auditoría; Backend: Aprobar publicación para sincronización; Implementar: Comparar la información de la publicación; Backend: Consultar seguimiento de correcciones; Implementar: Filtrar publicaciones pendientes de corrección; Implementar: Usar el título recomendado; Implementar: Registrar el seguimiento de correcciones; Implementar: Consultar recomendaciones de optimización; Implementar: Aprobar una publicación para sincronización

### Motor de auditoría con IA

- **Estado:** Abierta
- **Prioridad:** Media

Implementar capacidades para el rol Motor de auditoría con IA.

**Tickets (11):** Backend: Ejecutar auditoría integral de publicación; Backend: Identificar brechas de información; Backend: Calcular calidad de publicación; Backend: Generar recomendaciones de publicación; Implementar: Detectar inconsistencias entre los datos publicados; Backend: Emitir reporte de auditoría; Implementar: Auditar y optimizar el título; Implementar: Calcular la calificación de calidad; Implementar: Revisar la descripción del producto; Implementar: Identificar información faltante y preguntas potenciales; Implementar: Generar el reporte de auditoría

## Backlog de tickets (24)

### Responsable de catálogo y publicaciones

- **[Backlog]** Backend: Consultar estado de publicaciones auditadas _(task, Alta)_
  - Rol: Responsable de catálogo y publicaciones · HU: Consultar publicaciones auditadas
  - Implementación: Backend
- **[Backlog]** Backend: Analizar reporte de auditoría de publicación _(task, Alta)_
  - Rol: Responsable de catálogo y publicaciones · HU: Consultar publicaciones auditadas
  - Implementación: Backend
- **[Backlog]** Backend: Solicitar nueva auditoría de publicación _(task, Alta)_
  - Rol: Responsable de catálogo y publicaciones · HU: Consultar publicaciones auditadas
  - Implementación: Backend
- **[Backlog]** Backend: Aplicar correcciones en publicación Shopify _(task, Alta)_
  - Rol: Responsable de catálogo y publicaciones · HU: Consultar publicaciones auditadas
  - Implementación: Backend
- **[Backlog]** Implementar: Solicitar una nueva auditoría _(task, Media)_
  - Rol: Responsable de catálogo y publicaciones · HU: Solicitar una nueva auditoría
  - Implementación: Frontend
- **[Backlog]** Backend: Aprobar publicación para sincronización _(task, Alta)_
  - Rol: Responsable de catálogo y publicaciones · HU: Consultar publicaciones auditadas
  - Implementación: Backend
- **[Backlog]** Implementar: Comparar la información de la publicación _(task, Media)_
  - Rol: Responsable de catálogo y publicaciones · HU: Comparar la información de la publicación
  - Implementación: Frontend
- **[Backlog]** Backend: Consultar seguimiento de correcciones _(task, Alta)_
  - Rol: Responsable de catálogo y publicaciones · HU: Consultar publicaciones auditadas
  - Implementación: Backend
- **[Backlog]** Implementar: Filtrar publicaciones pendientes de corrección _(task, Media)_
  - Rol: Responsable de catálogo y publicaciones · HU: Filtrar publicaciones pendientes de corrección
  - Implementación: Frontend
- **[Backlog]** Implementar: Usar el título recomendado _(task, Media)_
  - Rol: Responsable de catálogo y publicaciones · HU: Usar el título recomendado
  - Implementación: Frontend
- **[Backlog]** Implementar: Registrar el seguimiento de correcciones _(task, Media)_
  - Rol: Responsable de catálogo y publicaciones · HU: Registrar el seguimiento de correcciones
  - Implementación: Frontend
- **[Backlog]** Implementar: Consultar recomendaciones de optimización _(task, Media)_
  - Rol: Responsable de catálogo y publicaciones · HU: Consultar recomendaciones de optimización
  - Implementación: Frontend
- **[Backlog]** Implementar: Aprobar una publicación para sincronización _(task, Media)_
  - Rol: Responsable de catálogo y publicaciones · HU: Aprobar una publicación para sincronización
  - Implementación: Frontend

### Motor de auditoría con IA

- **[Backlog]** Backend: Ejecutar auditoría integral de publicación _(task, Alta)_
  - Rol: Motor de auditoría con IA · HU: Analizar la información completa del producto
  - Implementación: Backend
- **[Backlog]** Backend: Identificar brechas de información _(task, Alta)_
  - Rol: Motor de auditoría con IA · HU: Analizar la información completa del producto
  - Implementación: Backend
- **[Backlog]** Backend: Calcular calidad de publicación _(task, Alta)_
  - Rol: Motor de auditoría con IA · HU: Analizar la información completa del producto
  - Implementación: Backend
- **[Backlog]** Backend: Generar recomendaciones de publicación _(task, Alta)_
  - Rol: Motor de auditoría con IA · HU: Analizar la información completa del producto
  - Implementación: Backend
- **[Backlog]** Implementar: Detectar inconsistencias entre los datos publicados _(task, Media)_
  - Rol: Motor de auditoría con IA · HU: Detectar inconsistencias entre los datos publicados
  - Implementación: Frontend
- **[Backlog]** Backend: Emitir reporte de auditoría _(task, Alta)_
  - Rol: Motor de auditoría con IA · HU: Analizar la información completa del producto
  - Implementación: Backend
- **[Backlog]** Implementar: Auditar y optimizar el título _(task, Media)_
  - Rol: Motor de auditoría con IA · HU: Auditar y optimizar el título
  - Implementación: Frontend
- **[Backlog]** Implementar: Calcular la calificación de calidad _(task, Media)_
  - Rol: Motor de auditoría con IA · HU: Calcular la calificación de calidad
  - Implementación: Frontend
- **[Backlog]** Implementar: Revisar la descripción del producto _(task, Media)_
  - Rol: Motor de auditoría con IA · HU: Revisar la descripción del producto
  - Implementación: Frontend
- **[Backlog]** Implementar: Identificar información faltante y preguntas potenciales _(task, Media)_
  - Rol: Motor de auditoría con IA · HU: Identificar información faltante y preguntas potenciales
  - Implementación: Frontend
- **[Backlog]** Implementar: Generar el reporte de auditoría _(task, Media)_
  - Rol: Motor de auditoría con IA · HU: Generar el reporte de auditoría
  - Implementación: Frontend

---

_Fin de la especificación._