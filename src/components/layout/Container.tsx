import styled from 'styled-components'

// Contenedor de página (spec R2.5 / design §4).
//
// `--screen-desktop` = min(1152px, 100% - 2 * --dh-page-x) y el padding lateral
// es `--dh-page-x` (64 ≥1025 · 32 en 641–1024 · 16 ≤640, definido en Theme.ts),
// así el contenido mide 1152 en desktop (1280 - 2·64, como el canvas del
// diseñador) y nunca desborda en móvil. `box-sizing: content-box` es
// deliberado: el max-width ya descuenta el padding.
//
// Uso: `<Container>` como wrapper, o `styled(Container)` para añadir reglas de
// layout (grid/flex) al propio contenedor. Acepta `as="section"`.
const Container = styled.div`
    box-sizing: content-box;
    width: auto;
    max-width: var(--screen-desktop);
    margin-left: auto;
    margin-right: auto;
    padding-left: var(--dh-page-x);
    padding-right: var(--dh-page-x);
`

export default Container
