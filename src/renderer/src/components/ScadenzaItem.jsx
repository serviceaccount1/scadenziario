import { Alert } from "react-bootstrap";

function ScadenzaItem({ data }) {
  console.log(data);
  return (
    <>
      <Alert
        variant={"light"}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
      
        }}
      >
        <div
          style={{
            height: "100%",
            width: "20%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h4>{data.azienda}</h4>
        </div>
        <div
          style={{
            height: "100%",
            width: "80%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
          }}
        >
          {data.scadenze.map((x) => {
            const stile = {
              width: "100%",
              display: "flex",
              alignContent: "cemter",
              justifyContent: "center",
              textDecoration: x.notificato ? "line-through" : "none",
              color: x.daNotificare && !x.notificato ? "lightgreen" : "black",
              fontWeight:x.daNotificare ? 700:300,
              padding:0,
              margin:0
            };
            return (
                <p style={stile}>{x.data}</p>
            );
          })}
        </div>
      </Alert>
    </>
  );
}

export default ScadenzaItem;
