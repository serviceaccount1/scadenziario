import { Form } from "react-bootstrap";

function FileUpload({ handleFile }) {
  return (
    <Form.Group>
      <Form.Label>Seleziona file</Form.Label>
      <Form.Control accept="application/pdf, image/png, image/jpeg" type="file" onChange={e=>handleFile(e.target.files[0])} />
    </Form.Group>
  );
}

export default FileUpload;
