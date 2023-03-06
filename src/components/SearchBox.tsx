import styled from "styled-components"

const SearchBoxWrapper = styled.div`
    background-color: #fff;
    height: 48px;
    width: var(--screen-desktop);
    margin: 0 auto;
    border-radius: var(--radius-xl);
    background-color: var(--color-neutral);
    box-shadow: var(--shadow);
    margin-top: 40px;
    display: flex;
    align-items: center;
    padding: 0 20px;
    box-sizing: border-box;
    svg {
        margin-right: 10px;
        fill: var(--color-text)
    }
    input, select {
        border: none;
        background-color: transparent;
        height: 100%;
        color: var(--color-text);
    }
    select {
        padding-left: 15px;
        min-width: 150px;
    }
    input {
        flex: 1;
        border-right: 1px solid var(--color-neutral-light);
    }
`

function SearchBox(): JSX.Element {
    return (
        <SearchBoxWrapper>
            <svg width="24" height="24" preserveAspectRatio="xMidYMid meet" viewBox="0 0 512 512"><path d="M443.5 420.2L336.7 312.4c20.9-26.2 33.5-59.4 33.5-95.5 0-84.5-68.5-153-153.1-153S64 132.5 64 217s68.5 153 153.1 153c36.6 0 70.1-12.8 96.5-34.2l106.1 107.1c3.2 3.4 7.6 5.1 11.9 5.1 4.1 0 8.2-1.5 11.3-4.5 6.6-6.3 6.8-16.7.6-23.3zm-226.4-83.1c-32.1 0-62.3-12.5-85-35.2-22.7-22.7-35.2-52.9-35.2-84.9 0-32.1 12.5-62.3 35.2-84.9 22.7-22.7 52.9-35.2 85-35.2s62.3 12.5 85 35.2c22.7 22.7 35.2 52.9 35.2 84.9 0 32.1-12.5 62.3-35.2 84.9-22.7 22.7-52.9 35.2-85 35.2z"></path></svg>
            <input type="text" placeholder="Busca tu producto..." />
            {/* <select>
                <option value="1">Todos</option>
                <option value="2">Polos</option>
                <option value="3">Accesorios</option>
            </select> */}
        </SearchBoxWrapper>
    )
}

export default SearchBox