import { Form } from "react-bootstrap"; 

function DatePicker({handleDate}){
    return(
        <Form.Group>
            <Form.Label>Seleziona Scadenza</Form.Label>
            <Form.Control onChange={e=>handleDate(e.target.value)} type="date"/>
        </Form.Group>
    )
};

export default DatePicker;