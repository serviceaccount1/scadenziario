// UX
import { Accordion, Form,Badge } from 'react-bootstrap'

function ContactAccordion({ title, body, onChangeInput, isLast,popLast }) {
  // function onChangeInput(){
  // }
  return (
    <Accordion >
    <Accordion.Item >
      <Accordion.Header >
        {title ? title : 'clicca per modificare'}
        {isLast ? <Badge bg="danger" onClick={popLast} style={{position:"absolute",right:10}} >x</Badge> : ''}
      </Accordion.Header>
      <Accordion.Body>
        <Form.Control
          onChange={(e) =>
            onChangeInput({
              id: body.id,
              field: 'name',
              value: e.target.value
            })
          }
          type="text"
          required
          placeholder="nome"
          value={body.name}
        />
        <Form.Control
          onChange={(e) =>
            onChangeInput({
              id: body.id,
              field: 'email',
              value: e.target.value
            })
          }
          type="text"
          required
          placeholder="email"
          value={body.email}
        />
        <Form.Control
          onChange={(e) =>
            onChangeInput({
              id: body.id,
              field: 'number',
              value: e.target.value
            })
          }
          type="number"
          required
          placeholder="numero"
          value={body.number}
        />
      </Accordion.Body>
    </Accordion.Item>
    </Accordion>
  )
}

export default ContactAccordion
