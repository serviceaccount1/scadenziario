import moment from "moment";
import { Accordion, Button, Table } from "react-bootstrap";
import { useState, useEffect } from "react";

function SelfNotifyIcon({selfNotify}) {
  return selfNotify ? (
    <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="green"
    class="bi bi-check-circle"
    viewBox="0 0 16 16"
  >
    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
    <path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05" />
  </svg>
  ) : (
    <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="red"
    class="bi bi-x-circle"
    viewBox="0 0 16 16"
  >
    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
  </svg>
  );
}

function ListItem({ data, remRef }) {
  let [scadenze, setScadenze] = useState({});

  useEffect(() => {
    const x = moment(data.scadenza, "DD-MM-YYYY");

    const primaScadenza = x.clone().subtract(15, "days").format("DD-MM-YYYY");
    const secondaScadewnza = x.clone().subtract(7, "days").format("DD-MM-YYYY");
    const terzaScadenza = x.clone().format("DD-MM-YYYY");

    setScadenze({
      [primaScadenza]: data.notificato[0],
      [secondaScadewnza]: data.notificato[1],
      [terzaScadenza]: data.notificato[2],
    });
  }, [data]);

  function IconaBidone() {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        fill="currentColor"
        class="bi bi-trash"
        viewBox="0 0 16 16"
      >
        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
      </svg>
    );
  }

  return (
    <Accordion>
      <Accordion.Item style={{ borderWidth: 3 }} eventKey="0">
        <Accordion.Header>
          {moment(data.scadenza, "DD-MM-YYYY").isSameOrBefore(
            moment(moment(), "DD-MM-YYYY"),
          ) &&
            !data.closed && (
              <svg
                style={{ marginRight: "10px" }}
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="black"
                class="bi bi-exclamation-triangle-fill"
                viewBox="0 0 16 16"
              >
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
              </svg>
            )}
          <span style={{ marginRight: 20 }}>
            <strong>{data.scadenza}</strong>
          </span>
          <span>{data.azienda}</span>
          {data.closed && <span style={{ marginLeft: "20px" }}>CHIUSO</span>}
        </Accordion.Header>
        <Accordion.Body>
          <ul>
            <li>
              {moment(data.scadenza, "DD-MM-YYYY").isSameOrBefore(
                moment(moment(), "DD-MM-YYYY"),
              )
                ? "Scaduto"
                : "Non scaduto"}
            </li>
            <li>Scadenza {data.scadenza}</li>
            <li>Notifica anche me <SelfNotifyIcon selfNotify={data.selfNotify}/></li>
            {data.file && (
              <li
                style={{ color: "blue", cursor: "pointer" }}
                onClick={() => window.api.openFile(data.file)}
              >
                apri il file
              </li>
            )}
          </ul>
          <br />
          <h5>Invia a</h5>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Numero</th>
              </tr>
            </thead>
            <tbody>
              {data.contatti.map((x) => (
                <tr>
                  <td>{x.name ? x.name : "..."}</td>
                  <td>{x.email ? x.email : "..."}</td>
                  <td>{x.number ? x.number : "..."}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <br />
          <h5>Notifiche</h5>
          <Table striped bordered hover>
            <thead>
              <tr>
                {Object.keys(scadenze).map((x) => (
                  <th>{x}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {Object.values(scadenze).map((x) => (
                  <th style={{ padding: 4, color: x ? "green" : "red" }}>
                    {x ? "notificato" : "non notificato"}
                  </th>
                ))}
              </tr>
            </tbody>
          </Table>
          <center>
            <Button
              onClick={() => remRef(data._id)}
              variant="danger"
              style={{ width: "90%", marginTop: "20px" }}
            >
              <IconaBidone />
            </Button>
          </center>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
}

export default ListItem;
