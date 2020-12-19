import React, { useState } from 'react'
import { Link as ReactRouterLink } from 'react-router-dom'

import {
  Background,
  Feature,
  Text,
  TextSmall,
  Link,
  Group,
  Profile,
  Dropdown,
  Picture,
  ButtonLink,
  Container,
  Logo,
  Search,
  SearchIcon,
  SearchInput,
  PlayButton
} from './styles/header'

export default function Header ({ bg = true, children, ...restProps }) {
  return bg ? <Background {...restProps}>{children}</Background> : children
}

Header.Feature = function HeaderFeature ({ children, ...restProps }) {
  return <Feature {...restProps}>{children}</Feature>
}
Header.Profile = function HeaderProfile ({ children, ...restProps }) {
  return <Profile {...restProps}>{children}</Profile>
}

Header.Picture = function HeaderPicture ({ src, ...restProps }) {
  return <Picture {...restProps} src={`images/users/${src}.png`} />
}

Header.Search = function HeaderSearch ({
  searchTerm,
  searchHandler,
  ...restProps
}) {
  const [searchActive, setSearchActive] = useState(false)

  return (
    <Search {...restProps}>
      <SearchIcon
        onClick={() => setSearchActive(searchActive => !searchActive)}
      >
        <img src='/images/icons/search.png' alt='Search' />
      </SearchIcon>
      <SearchInput
        value={searchTerm}
        onChange={({ target }) => searchHandler(target.value)}
        placeholder='Search Films and Series'
        active={searchActive}
      />
    </Search>
  )
}

Header.PlayButton = function HeaderPlayButton ({ children, ...restProps }) {
  return <PlayButton {...restProps}>{children}</PlayButton>
}

Header.Dropdown = function HeaderDropdown ({ children, ...restProps }) {
  return <Dropdown {...restProps}>{children}</Dropdown>
}
Header.Text = function HeaderText ({ children, ...restProps }) {
  return <Text {...restProps}>{children}</Text>
}

Header.TextSmall = function HeaderTextSmall ({ children, ...restProps }) {
  return <TextSmall {...restProps}>{children}</TextSmall>
}

Header.TextLink = function HeaderTextLink ({ children, ...restProps }) {
  return <Link {...restProps}>{children}</Link>
}

Header.Frame = function HeaderFrame ({ children, ...restProps }) {
  return <Container {...restProps}>{children}</Container>
}

Header.Group = function HeaderGroup ({ children, ...restProps }) {
  return <Group {...restProps}>{children}</Group>
}

Header.ButtonLink = function HeaderButtonLink ({ children, ...restProps }) {
  return <ButtonLink {...restProps}>{children}</ButtonLink>
}

Header.Logo = function HeaderLogo ({ to, ...restProps }) {
  return (
    <ReactRouterLink to={to}>
      <Logo {...restProps} />
    </ReactRouterLink>
  )
}
