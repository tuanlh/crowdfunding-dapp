import React, {Component} from 'react'
import { Navbar, Form, Button, Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavLink } from 'react-router-dom';


class Header extends Component {
  
  render() {
    const links = [
      {
        path: '/',
        icon: 'home',
        text: 'Home'
      },
      {
        path: '/account',
        icon: 'wallet',
        text: 'Account'
      },
      {
        path: '/feature',
        icon: 'list-alt',
        text: 'Features'
      },
      {
        path: '/help',
        icon: 'question-circle',
        text: 'Help'
      },
      {
        path: '/about',
        icon: 'info-circle',
        text: 'About'
      }
    ]
    return (
      <Navbar bg="dark" variant="dark" expand="lg">
        <Navbar.Brand>Crowdfunding DApp</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            {links.map((link, i) => (
              <Nav.Item 
                key={i}>
                <NavLink to={link.path} className="nav-link" activeClassName="active" exact={true}>
                  <FontAwesomeIcon icon={link.icon} /> {link.text}
                </NavLink>
              </Nav.Item>
            ))}
          </Nav>
          <Form inline>
            <Form.Control type="text" placeholder="Search" className="mr-sm-2" />
            <Button variant="outline-success">Search</Button>
          </Form>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

export default Header;