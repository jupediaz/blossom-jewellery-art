-- Create Blossom Jewelry idea in CodeLabs Hub
-- All content in Spanish (Hub convention)

BEGIN;

-- 1. Create the idea
INSERT INTO ideas (id, title, description, status, overall_score, created_by)
VALUES (
  gen_random_uuid(),
  'Blossom - Joyería Artesanal Botánica',
  $$Proyecto de e-commerce para joyería artesanal de arcilla polimérica creada por Olha Finiv-Hoshovska (@blossomjewelleryart). Posicionamiento como "arte botánico portable" en el segmento premium del mercado de Marbella y online.

Olha es psicóloga de formación y artista de vocación, residente en Marbella. Cada pieza tarda 8-12 horas en crearse, esculpiendo pétalo a pétalo flores botánicas hiperrealistas. El proyecto busca transformar su presencia en Instagram (416 posts, 309 seguidores) en un negocio viable con tienda online propia, presencia en boutiques de Marbella, y canales marketplace (Etsy, Amazon Handmade).

Stack técnico: Next.js + Stripe (solución custom, sin Shopify). Mercado objetivo: mujeres 25-55 de la comunidad internacional de Marbella (153 nacionalidades), con foco en expats nórdicas/británicas de alto poder adquisitivo. Precio retail: pendientes 45-120 EUR, collares 80-250 EUR. Revenue objetivo Year 1: 10-30K EUR.$$,
  'analyzed',
  82,
  '952227fb-3b4e-478f-ad7c-16f22d9ab5e2'
);

-- Get the idea ID
DO $$
DECLARE
  v_idea_id UUID;
BEGIN
  SELECT id INTO v_idea_id FROM ideas
  WHERE title = 'Blossom - Joyería Artesanal Botánica'
  AND created_by = '952227fb-3b4e-478f-ad7c-16f22d9ab5e2'
  ORDER BY created_at DESC LIMIT 1;

  -- 2. Insert all 10 sections

  -- MARKET ANALYSIS
  INSERT INTO idea_sections (idea_id, section_type, content_es, generation_count)
  VALUES (v_idea_id, 'market_analysis', $section$## Análisis de Mercado

### Tamaño del Mercado
El mercado global de arcilla polimérica se estima entre $320M-$1.2B (2024-2025), con CAGR de 4.2-6.5% hasta 2033. **El segmento de joyería y artes representa el 65.3%** de las aplicaciones, lo que implica un mercado direccionable de $200M-$780M.

El mercado de joyería en España alcanzó **$5.89B en 2024** y se proyecta a **$9.23B para 2033** (CAGR 5.12%).

### Drivers de Crecimiento
1. **Efecto redes sociales**: Instagram, TikTok y Pinterest han disparado el interés. Más del 40% de la demanda viene de hobbyistas y micro-emprendedores
2. **Sostenibilidad**: 71% de consumidores menores de 35 priorizan sostenibilidad en compras
3. **Demanda de personalización**: 63% de Millennials y Gen Z prefieren marcas con opciones personalizadas
4. **Tendencia artesanal premium**: Los consumidores migran de fast-fashion a piezas únicas con historia

### Demografía Clave
- **Compradoras principales**: Mujeres (67% de todas las compras de joyería)
- **Rango de edad core**: 18-44 años (Millennials y Gen Z)
- **Valores clave**: Autoexpresión (48% de compradores Gen Z de lujo la priorizan sobre marcas), sostenibilidad, unicidad

### Tendencias 2025-2026
- Piezas bold y statement (aros grandes, pendientes geométricos)
- **Inspiración botánica y natural** (la especialidad de Blossom)
- Estéticas cottagecore y celestial
- Minimalismo con tonos tierra

### Mercado de Marbella
Marbella tiene ~165,000 habitantes, **30% extranjeros de 153 nacionalidades**. El número de UHNWI en la región crece un 27% (2020-2025). Segmentos clave: expats nórdicos/británicos (diseño, €50-200), rusos (lujo visible, €150-400+), turistas de verano (60-70% del tráfico mayo-octubre).$section$, 1);

  -- COMPETITIVE ANALYSIS
  INSERT INTO idea_sections (idea_id, section_type, content_es, generation_count)
  VALUES (v_idea_id, 'competitive_analysis', $section$## Análisis Competitivo

### Competidores en Etsy (5,000+ listings activos)
| Tienda | Rango Precio | Diferenciador |
|--------|-------------|---------------|
| BloomMercantileCo | $18-$45 | Diseños florales/botánicos, branding cohesivo |
| VeeClayDesignShop | $15-$40 | Estilos trendy, turnaround rápido |
| BrightClayDays | $20-$45 | Colores vibrantes, statement pieces |
| MilastudioShop | $20-$50 | Estética minimalista, tonos tierra |
| TansyAndTopazClayCo | $22-$48 | Mixed media, acentos dorados |

### Marcas Independientes Online
| Marca | Precio | Posicionamiento |
|-------|--------|----------------|
| Olim Clay Co. | $25-$60 | Nature-lovers, arte en arcilla |
| Clay by Denae | $20-$50 | Uso diario, hipoalergénico |
| Balwin Studios | $25-$55 | Joyería artística |

### Nivel Premium/Galería
- **Artful Home**: $65-$650 por pieza. Art jewelry de nivel museo
- **NOVICA**: $25-$120. Marketplace artesano global, fair trade

### Gaps del Mercado (Oportunidades para Blossom)
1. **Nadie domina el nicho botánico hiperrealista** en el rango €70-250
2. La mayoría de competidores venden a $15-$50 — hay espacio arriba
3. Pocos competidores tienen presencia local + online fuerte
4. Falta de storytelling potente en la mayoría de marcas
5. El mercado de Marbella no tiene un artesano de joyería botánica posicionado

### Ventajas Competitivas de Blossom
- **Realismo botánico excepcional** (8-12 horas por pieza)
- **Marbella como base**: acceso directo a clientela de alto poder adquisitivo
- **Background en psicología**: comprensión profunda del vínculo emocional con la belleza
- **Posicionamiento "art jewelry"**: compite con galerías, no con craft fairs
- **Multilingüe**: inglés + español + potencial ucraniano/ruso para la comunidad local$section$, 1);

  -- FINANCIAL VIABILITY
  INSERT INTO idea_sections (idea_id, section_type, content_es, generation_count)
  VALUES (v_idea_id, 'financial_viability', $section$## Viabilidad Financiera

### Estructura de Precios Retail
| Producto | Rango (EUR) | Justificación |
|----------|------------|---------------|
| Pendientes simples | 45-65 | Punto de entrada, ideal para regalo |
| Pendientes statement | 70-120 | Piezas detalladas, conversación |
| Collares (colgante) | 80-150 | Uso diario, impacto visual fuerte |
| Collares statement | 150-250 | 10-15+ horas de trabajo, pieza central |
| Pulseras | 60-150 | Según complejidad |
| Bridal/ocasión especial | 200-500+ | Custom, posicionamiento premium |

### Fórmula de Pricing
```
Precio Retail = (Materiales + Labor + Overhead) x 2.5-3.0
Materiales: arcilla (2-5€) + hallazgos (3-8€) + packaging (6-12€)
Labor: Horas x 15-25€/hora
Overhead: 15-20%
```

### Márgenes por Canal
| Canal | Fee | Neto por venta de 100€ |
|-------|-----|----------------------|
| Web propia (Stripe) | 1.5% + 0.25€ | ~98€ |
| Etsy | ~10-12% | ~88-90€ |
| Amazon Handmade | 15% | ~85€ |
| Boutique (wholesale 50%) | 50% | 50€ |

### Costes Operacionales (Solución Custom)
- Hosting (Vercel free tier): 0€/mes
- Dominio: ~15€/año
- Stripe fees: 1.5% + 0.25€ por transacción
- Packaging: 6-12€/pedido
- **Total fijo anual: ~15€ + tiempo de desarrollo**

### Proyecciones Financieras
| Métrica | Año 1 | Año 2 | Año 3 |
|---------|-------|-------|-------|
| Revenue | 10-30K€ | 30-80K€ | 80-150K+€ |
| Margen bruto | 60%+ | 65%+ | 65%+ |
| Margen neto | 40%+ | 45%+ | 45%+ |
| AOV | 50-80€ | 60-100€ | 70-120€ |
| Pedidos/mes | 15-40 | 40-80 | 80-150+ |
| Repeat rate | 15% | 20-25% | 25-30% |

### Break-Even
Con inversión inicial mínima (~500€ en materiales + packaging + dominio), el break-even se alcanza en **3-6 meses** con 15-20 pedidos/mes a un AOV de 60€.$section$, 1);

  -- MARKETING STRATEGY
  INSERT INTO idea_sections (idea_id, section_type, content_es, generation_count)
  VALUES (v_idea_id, 'marketing_strategy', $section$## Estrategia de Marketing

### Canal Principal: Instagram (@blossomjewelleryart)
**Estado actual**: 416 posts, 309 seguidores. Necesita optimización de perfil y estrategia de contenido.

#### Pilares de Contenido
| Pilar | % | Propósito | Formato |
|-------|---|-----------|---------|
| El Arte (Producto) | 30% | Mostrar piezas terminadas | Carousel, Reels |
| El Proceso | 25% | Mostrar artesanía, construir valor percibido | Reels, Stories, Time-lapses |
| La Artista | 20% | Olha modelando, vida en estudio | Reels, Stories |
| La Inspiración | 15% | Jardines de Marbella, paletas de color | Static, Carousel |
| Comunidad | 10% | Fotos de clientas, testimonios | Stories, UGC |

#### Calendario: 3-4 posts/semana, Stories diarias, 2-3 Reels/semana

### Estrategia B2B — Boutiques de Marbella
**Tier 1**: Concept stores de Puerto Banús, boutiques del Casco Antiguo, tiendas de hotel (Marbella Club, Puente Romano)
**Tier 2**: Tiendas de decoración, galerías, spas, peluquerías premium
**Tier 3**: Pop-up markets, galas benéficas, ferias de bodas

**Modelo**: Comenzar con consignación (riesgo cero para boutiques), migrar a wholesale (50% retail) tras datos de sell-through.

### Influencer Marketing
- Gift 3-5 micro-influencers de Marbella (5K-50K seguidores)
- Formato: pieza gratis a cambio de contenido orgánico
- Foco: lifestyle, moda, wellness influencers del área

### Media Outreach
Inspirado en el caso de estudio de $176K/año: no construir audiencia propia desde cero, sino **posicionarse en medios que la clientela ya lee**: Essential Marbella Magazine, Sur in English, blogs de lifestyle de Costa del Sol.

### Multi-Canal de Ventas
1. **Web propia** (Next.js + Stripe): márgenes más altos, control total
2. **Instagram Shopping**: integración directa
3. **Etsy**: descubrimiento y credibilidad (meses 3-6)
4. **Mercados artesanales**: Mercado Internacional Puerto Banús (mejor mercado artesanal nacional), Plaza de los Naranjos (domingos)
5. **Amazon Handmade**: piezas estandarizadas, FBM primero (Q3-Q4)$section$, 1);

  -- IDEAL CUSTOMER PROFILE
  INSERT INTO idea_sections (idea_id, section_type, content_es, generation_count)
  VALUES (v_idea_id, 'ideal_customer_profile', $section$## Perfil de Cliente Ideal

### Persona 1: "Marina" — La Expat Affluente (Primaria)
- **Edad**: 35-55
- **Nacionalidad**: Británica, escandinava, holandesa, alemana, rusa
- **Vive en**: Marbella, Nueva Andalucía, zona La Zagaleta
- **Ingresos**: Altos (pareja en finanzas, inmobiliaria o negocios)
- **Estilo de vida**: Almuerzos en Nobu Marbella, yoga, beach clubs, eventos benéficos
- **Comportamiento de compra**: Busca piezas únicas que generen conversación. Cansada de los mismos logos de lujo. Valora "descubrir" un nuevo artesano
- **Por qué Blossom**: "Quiero algo que nadie más tenga. Esto es arte que puedo llevar puesto"
- **Dónde alcanzarla**: Instagram, boutiques locales, eventos, grupos de Facebook de expats

### Persona 2: "Sofía" — La Profesional Española (Secundaria)
- **Edad**: 30-45
- **Vive en**: Marbella, Málaga o visita regularmente
- **Ingresos**: Clase media-alta
- **Comportamiento**: Investiga antes de comprar. Lee la página "Sobre nosotros". Le importa la historia del maker
- **Por qué Blossom**: "Esto es artesanía de verdad. Me encanta apoyar a creadores independientes"
- **Dónde alcanzarla**: Instagram, mercados artesanales, boca a boca

### Persona 3: La Turista que Busca un Recuerdo Especial
- **Edad**: 25-60
- **Nacionalidad**: Cualquiera
- **Contexto**: Visitando Marbella/Costa del Sol de vacaciones
- **Por qué Blossom**: "Esto es mucho mejor que los souvenirs genéricos. Es una pieza de arte de Marbella"
- **Dónde alcanzarla**: Boutiques en Puerto Banús, Casco Antiguo, tiendas de hotel, mercados

### Segmentos de Alto Valor en Marbella
| Segmento | Rango Precio | Características |
|----------|-------------|-----------------|
| Nórdicos/Británicos | 50-200€ | Diseño-conscientes, valoran artesanía |
| Rusos/Este Europa | 150-400+€ | Lujo visible, menos sensibles al precio |
| Turistas de verano | 15-65€ | Compra impulsiva, recuerdo especial |
| Latinoamericanos | 35-100€ | Fashion-forward, colores vibrantes |

### Sensibilidad sobre Nacionalidad
La marca debe ser **neutral en temas geopolíticos**. La historia de Olha se enmarca como "artista que eligió Marbella", nunca en contexto político. Su identidad ucraniana se menciona naturalmente pero sin marco político.$section$, 1);

  -- SEO KEYWORDS
  INSERT INTO idea_sections (idea_id, section_type, content_es, generation_count)
  VALUES (v_idea_id, 'seo_keywords', $section$## Palabras Clave SEO

### Keywords Principales (Alta Intención de Compra)
| Keyword | Volumen Est. | Dificultad | Intent |
|---------|-------------|-----------|--------|
| handmade jewelry marbella | Medio | Baja | Transaccional |
| botanical jewelry | Medio | Media | Transaccional |
| artisan jewelry spain | Medio | Media | Transaccional |
| floral earrings handmade | Alto | Media | Transaccional |
| polymer clay flower jewelry | Medio | Baja | Transaccional |
| unique jewelry gifts | Alto | Alta | Transaccional |
| art jewelry online | Medio | Media | Transaccional |

### Keywords Long-Tail (Menor Competencia)
| Keyword | Cluster |
|---------|---------|
| handmade flower earrings marbella | Local + Producto |
| botanical art jewelry spain | Geográfico + Nicho |
| sculpted floral necklace | Producto específico |
| artisan jewelry costa del sol | Local |
| one of a kind flower jewelry | Propuesta de valor |
| wearable botanical art | Branding |
| hypoallergenic handmade earrings | Beneficio |
| custom flower jewelry commission | Servicio |
| luxury handmade jewelry spain | Premium + Geográfico |
| unique bridal jewelry botanical | Ocasión + Nicho |

### Clusters Temáticos para Content Marketing
1. **"Botanical Jewelry"**: Blog posts sobre inspiración floral, tipos de flores, proceso creativo
2. **"Marbella Artisan"**: Contenido local, lifestyle mediterráneo, guías de compra en Marbella
3. **"Art Jewelry Guide"**: Educación sobre art jewelry vs commodity jewelry, cómo valorar artesanía
4. **"Gift Guide"**: Guías de regalos por ocasión (bodas, cumpleaños, Navidad)
5. **"Behind the Craft"**: Proceso creativo, materiales premium, time-lapses

### Estrategia SEO Técnica
- **Blog integrado** en la web (Next.js con MDX o CMS headless)
- **Schema markup**: Product, LocalBusiness, ArtGallery
- **Google Business Profile**: Registrar como negocio local en Marbella
- **Pinterest**: Canal SEO secundario ideal para joyería visual
- **Backlinks target**: Essential Marbella, blogs de lifestyle, directorio de artesanos$section$, 1);

  -- NAMING SUGGESTIONS
  INSERT INTO idea_sections (idea_id, section_type, content_es, generation_count)
  VALUES (v_idea_id, 'naming_suggestions', $section$## Sugerencias de Naming

### Nombre Actual: "Blossom"
**Riesgo**: "Blossom Jewelry" está MUY saturado (blossomjewelry.co, jewelleryblossom.com con trademark registrada, Bloom & Blossom Jewelry en Faire). Se necesita un diferenciador.

### 6 Opciones Propuestas

#### Opción A: Blossom Jewellery Art (RECOMENDADA)
- Coincide con Instagram existente: @blossomjewelleryart
- Posiciona como ARTE, no solo joyería
- Dominio disponible: **blossomjewelleryart.com**
- Directorio: `blossom-jewellery-art`

#### Opción B: Blossom Art Jewelry
- Enfatiza "art jewelry" como categoría reconocida en la industria
- Limpio, profesional, buena SEO
- Dominio disponible: **blossomartjewelry.com**

#### Opción C: Wear a Blossom
- Catchy, memorable, orientado a la acción
- "Wear a garden" conecta con la propuesta de valor
- Dominio disponible: **wearablossom.com**

#### Opción D: Blossom by Olha
- Marca personal, artisan-first
- Conecta la creadora con la marca
- Dominio disponible: **blossombyolha.com**

#### Opción E: Blossom Marbella
- Posicionamiento local, asociación luxury
- Dominio disponible: **blossommarbella.com** y **blossom-marbella.com**

#### Opción F: Petal by Olha
- Nombre único, CERO conflictos de trademark
- "Petal" referencia directa al craft (esculpir pétalos)
- Más distintivo que "Blossom"
- Dominio disponible: **petalbyolha.com**

### Top 3 Recomendaciones
1. **Blossom Jewellery Art** + blossomjewelleryart.com — Coincide con Instagram, sin rebranding necesario, .com disponible
2. **Blossom Art Jewelry** + blossomartjewelry.com — Inglés americano para internacional, "Art Jewelry" es categoría reconocida
3. **Petal by Olha** + petalbyolha.com — Más distintivo, cero riesgo de trademark, marca personal fuerte

### Dominios Disponibles (verificados vía WHOIS 2026-02-12)
blossomjewelleryart.com, blossomjewelry.art, blossomjewellery.art, blossomartjewelry.com, wearablossom.com, blossombyolha.com, blossom-marbella.com, blossommarbella.com, blossomjewelry.eu, petalbyolha.com

### Dominios NO Disponibles
blossomjewelry.com (GoDaddy, 2013), byblossom.com (DropCatch, Nov 2025), byolha.com (Nicnames, Aug 2025), shopblossom.com (GoDaddy, 2010)$section$, 1);

  -- GROWTH STRATEGIES
  INSERT INTO idea_sections (idea_id, section_type, content_es, generation_count)
  VALUES (v_idea_id, 'growth_strategies', $section$## Estrategias de Crecimiento

### Fase 1: Fundación (Semanas 1-4)
- Finalizar identidad visual (logo, colores, tipografía)
- Optimizar perfil de Instagram
- Crear buffer de 15-20 piezas de contenido
- Diseñar y pedir packaging
- Construir tienda web (Next.js + Stripe)
- Fotografiar todas las piezas existentes

### Fase 2: Lanzamiento Local (Semanas 5-12)
- Publicar 3-4 posts/semana consistentemente
- Acercar 3-5 boutiques locales (consignación)
- Participar en 1-2 mercados artesanales
- Gift a micro-influencers
- Recoger testimonios y reseñas
- Lanzar servicio de pedidos custom

### Fase 3: Crecimiento (Meses 4-6)
- Sesión de fotos lifestyle profesional
- Lanzar colección estacional
- Expandir a 5-8 boutiques
- Explorar mercado bridal
- Iniciar email list
- Evaluar pricing wholesale

### Fase 4: Escala (Meses 7-12)
- Listar en Etsy (bestsellers)
- Explorar envío EU
- Piezas "collector" de edición limitada
- Press coverage (Essential Marbella, Sur in English)
- Evaluar contratación de asistente
- Trunk shows en hoteles premium

### Growth Loops
1. **Contenido de proceso** → Engagement → Algoritmo → Descubrimiento → Ventas
2. **Pieza en boutique** → Cliente la ve → Pregunta por la marca → Visita Instagram/web → Compra directa (mayor margen)
3. **Etsy como discovery** → Primera compra → Tarjeta de agradecimiento con URL propia → Repeat en web (sin fees de Etsy)
4. **Influencer gifting** → Contenido orgánico → Audiencia nueva → Seguidores → Conversión

### Estrategias de Retención
- Email post-compra con care instructions
- Descuento 10% para repeat customers
- Acceso anticipado a nuevas colecciones para clientes VIP
- Programa "Collector": 5 piezas = personalización gratuita

### Métricas Target por Fase
| Fase | Seguidores IG | Pedidos/mes | Revenue/mes |
|------|--------------|-------------|-------------|
| F1 (M1) | 400-500 | 5-10 | 250-800€ |
| F2 (M3) | 600-1K | 15-25 | 900-2K€ |
| F3 (M6) | 1K-2K | 25-40 | 1.5-3K€ |
| F4 (M12) | 3K-5K | 40-80 | 2.5-6K€ |$section$, 1);

  -- SWOT ANALYSIS
  INSERT INTO idea_sections (idea_id, section_type, content_es, generation_count)
  VALUES (v_idea_id, 'swot_analysis', $section$## Análisis SWOT

### Fortalezas
1. **Artesanía excepcional**: 8-12 horas por pieza, realismo botánico difícil de replicar. La calidad del trabajo de Olha es objetivamente superior a la mayoría de competidores en Etsy
2. **Ubicación privilegiada**: Marbella ofrece acceso directo a clientela de alto poder adquisitivo de 153 nacionalidades. Puerto Banús tiene el mejor mercado artesanal de España
3. **Background diferenciador**: Psicóloga de formación — comprensión profunda del vínculo emocional con la belleza. Storytelling potente y auténtico
4. **Inversión inicial mínima**: No requiere gran capital. Stack técnico custom (Next.js + Stripe) = ~15€/año vs ~743€/año con Shopify
5. **Instagram establecido**: 416 posts de contenido existente. Base para construir, no empezar de cero

### Debilidades
1. **Capacidad de producción limitada**: 8-12 horas por pieza limita el volumen. No escalable sin simplificar diseños o contratar
2. **Seguidores bajos**: 309 seguidores tras 416 posts indica problemas de estrategia de contenido/engagement
3. **Sin web/e-commerce**: Actualmente sin canal de venta online propio
4. **Percepción del material**: "Arcilla polimérica" puede percibirse como inferior a metales preciosos. Requiere educación del cliente
5. **Marca nueva**: Sin reseñas, sin testimonios, sin historial de ventas. La credibilidad debe construirse desde cero

### Oportunidades
1. **Mercado premium desatendido**: No hay artesano de joyería botánica posicionado en Marbella en el rango €70-250
2. **Turismo de lujo creciente**: UHNWI en la región crece 27% (2020-2025). Marbella se consolida como destino de lujo
3. **Tendencia "art jewelry"**: Artful Home vende piezas similares a $65-$650. El mercado premium existe y crece
4. **Bridal market**: Joyería botánica custom para bodas — comisiones de €200-500+ con alta demanda en Marbella
5. **Workshop experiences**: €40-80 por persona en talleres "haz tu propia joyería". Revenue complementario con alto margen

### Amenazas
1. **Saturación del nombre "Blossom"**: Múltiples marcas existentes con nombres similares. Riesgo de trademark en Clase 14
2. **Competencia Etsy de bajo precio**: Miles de vendedores a $15-35 pueden confundir la percepción de valor si no se diferencia bien
3. **Estacionalidad**: 60-70% del tráfico turístico en Marbella es mayo-octubre. Cash flow irregular
4. **Fragilidad del producto**: Arcilla polimérica es más frágil que metal. Riesgo en envío y en FBA
5. **Dependencia de una persona**: Todo el proceso creativo depende de Olha. Enfermedad o burnout = cero producción$section$, 1);

  -- TECHNICAL FEASIBILITY
  INSERT INTO idea_sections (idea_id, section_type, content_es, generation_count)
  VALUES (v_idea_id, 'technical_feasibility', $section$## Viabilidad Técnica

### Stack Recomendado (Custom, sin Shopify)
| Componente | Tecnología | Coste |
|-----------|-----------|-------|
| Frontend | Next.js (App Router) | 0€ |
| Hosting | Vercel (free tier) | 0€ |
| Pagos | Stripe (EU: 1.5% + 0.25€) | Variable |
| CMS/Contenido | Sanity (free tier) o MDX | 0€ |
| Base de datos | Neon PostgreSQL (free tier) | 0€ |
| Email transaccional | Resend (free tier 100/día) | 0€ |
| Dominio | Via Spaceship | ~15€/año |
| **Total fijo anual** | | **~15€** |

### Comparativa de Costes Anuales (Revenue 27K€)
| Plataforma | Fijo Anual | Variable (3%) | Total Año 1 |
|-----------|-----------|---------------|-------------|
| **Custom (Next.js)** | **15€** | **~480€** | **~495€ + dev time** |
| Shopify Basic + Mavon | 743€ | ~810€ | ~1,553€ |
| Squarespace Core | 300€ | ~810€ | ~1,110€ |
| Etsy solo | 0€ | ~2,970€ | ~2,970€ |

**Ahorro vs Shopify: ~1,058€/año**

### Starters/Boilerplates Disponibles
- **Medusa + Next.js**: E-commerce headless completo, Stripe integrado, inventario, pedidos
- **NextMerce**: Boilerplate gratuito con Sanity CMS + Stripe
- **Shofy Jewelry**: Template Next.js específico para joyería
- **Boundless Commerce**: Templates React con Stripe

### Funcionalidades Requeridas (MVP)
- [ ] Catálogo de productos con fotos (galería, zoom, carousel)
- [ ] Carrito de compra y checkout (Stripe)
- [ ] Página "About" con brand story
- [ ] Instagram Shopping integration
- [ ] Multi-idioma (EN primario, ES secundario)
- [ ] Mobile-responsive (mobile-first)
- [ ] SEO (meta tags, structured data, sitemap)
- [ ] Blog (content marketing)
- [ ] Formulario de pedidos custom
- [ ] Analytics (Plausible o Umami, privacy-first)

### Complejidad y Timeline
| Fase | Duración Estimada | Entregable |
|------|------------------|-----------|
| Setup + diseño | 1 semana | Repo, diseño base, theme |
| Catálogo + producto | 1 semana | Product pages, galería, CMS |
| Checkout + pagos | 3-4 días | Stripe integration, carrito |
| About + contenido | 2-3 días | Brand pages, blog setup |
| Instagram + SEO | 2-3 días | Meta tags, Shopping, sitemap |
| Testing + lanzamiento | 2-3 días | QA, deploy, DNS |
| **Total MVP** | **~3-4 semanas** | Tienda funcional |

### Riesgos Técnicos
1. **Tiempo de desarrollo**: 40-80 horas. Viable dado que tenemos las skills in-house
2. **Mantenimiento**: Sin equipo de soporte 24/7 como Shopify. Mitigado por Vercel (zero-ops hosting)
3. **Instagram Shopping**: Requiere Business Account + catálogo de Facebook Commerce Manager
4. **Stripe en España**: Requiere NIF/NIE español para cuenta business

### Infraestructura de Imágenes
Para producto con muchas fotos (5-8 por pieza x 50+ piezas):
- **Cloudflare R2** para almacenamiento de imágenes (económico, CDN global)
- **Next.js Image Optimization** para responsive images
- **WebP/AVIF** para rendimiento$section$, 1);

END;
$$;

COMMIT;
