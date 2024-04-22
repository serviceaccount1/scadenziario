import { Container, Form, Button, Badge } from "react-bootstrap";
import Navbar from "react-bootstrap/Navbar";

function ContainerInsideExample({
  toggleAddModal,
  notifiche,
  toggleNotificationModal,
  handleDateFilterChange,
}) {
  function Bell() {
    return (
      <div
        onClick={() => toggleNotificationModal()}
        style={{ cursor: "pointer",marginLeft:"20px" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="25"
          height="25"
          fill="white"
          className="bi bi-bell-fill"
          viewBox="0 0 16 16"
        >
          <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2m.995-14.901a1 1 0 1 0-1.99 0A5 5 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901" />
        </svg>
        {notifiche && notifiche > 0 ? (
          <Badge pill bg="danger" style={{ position: "absolute" }}>
            {notifiche}
          </Badge>
        ) : (
          ""
        )}
      </div>
    );
  }

  return (
    <Navbar bg="primary" expand="lg" style={{ height: "10%" }}>
      <Container style={{ display: "flex", flexDirection: "row" }}>
        <div style={{width:"70%",display:"flex",justifyContent:"space-around",alignItems:"center"}}>
          <Navbar.Brand style={{ color: "white",fontSize:"2rem"}}>Scadenziario</Navbar.Brand>
          <Form.Control
            style={{ width: 300,maxHeight:40 }}
            type="date"
            placeholder="Search"
            className="me-2"
            aria-label="Search"
            onChange={(e) => handleDateFilterChange(e.target.value)}
          />
        </div>
        <div
          style={{
            width: "30%",
            display: "flex",
            justifyContent: "end",
            alignItems:"center"
          }}
        >
          <Button onClick={toggleAddModal} style={{ borderColor: "white" }}>
            Aggiungi
          </Button>
          <Bell />
        </div>
      </Container>
    </Navbar>
  );
}

export default ContainerInsideExample;
