import styled from 'styled-components'

const IllustrationWrapper = styled.div`
    width: 140px;
    height: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    svg {
        width: 100%;
        height: 100%;
        display: block;
        overflow: visible;
    }
    @media screen and (max-width: 768px){
        width: 120px;
        height: 120px;
    }
`

export default IllustrationWrapper
