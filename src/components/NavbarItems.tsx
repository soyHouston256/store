import ThemeSwitch from '@/components/ThemeSwitch'
import styled from 'styled-components';

function NavbarItems() {
	const NavbarItems = styled.ul`
		display: flex;
		align-items: center;
		gap: 20px;
		li svg {
			fill: var(--color-text);
			width: 28px;
			height: 28px;
		}
	`

	return (
		<NavbarItems>
			<li>
				<ThemeSwitch />
			</li>
			< li >
				<svg preserveAspectRatio= "xMidYMid meet" viewBox = "0 0 256 256" > <path d="M94 216a14 14 0 1 1-14-14a14 14 0 0 1 14 14Zm90-14a14 14 0 1 0 14 14a14 14 0 0 0-14-14Zm43.5-128.4L201.1 166a22.2 22.2 0 0 1-21.2 16H84.1a22.2 22.2 0 0 1-21.2-16L36.5 73.8v-.3l-9.8-34a1.9 1.9 0 0 0-1.9-1.5H8a6 6 0 0 1 0-12h16.8a14.1 14.1 0 0 1 13.5 10.2L46.8 66h174.9a6 6 0 0 1 4.8 2.4a6 6 0 0 1 1 5.2ZM213.8 78H50.2l24.3 84.7a10 10 0 0 0 9.6 7.3h95.8a10 10 0 0 0 9.6-7.3Z" > </path></svg >
			</li>
		</NavbarItems>
	);
}

export default NavbarItems