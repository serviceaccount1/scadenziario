// UI
import { Modal, Button, Form, Badge } from "react-bootstrap";

// UX
import { useEffect, useState } from "react";
import { parse, v4 as uuidv4 } from "uuid";

// components;
import ContactAccordion from "./ContactAccordion.jsx";
import FileUpload from "./FileUpload.jsx";
import Datepicker from "./Datepicker.jsx";
import moment from "moment";

const emptyContact = {
  name: "",
  email: "",
  number: "",
  id: uuidv4(),
};

function AddModal({ visible, toggleModal,updateRefs }) {
  let [azienda, setAzienda] = useState("");
  let [sendToMe, setSendToMe] = useState(true);
  let [file, setFile] = useState("");
  let [dataScadenza, setDataScadenza] = useState("");
  let [contatti, setContatti] = useState([
    {
      name: "",
      email: "",
      number: "",
      id: uuidv4(),
    },
  ]);

  // ! inserisci il primo utente vuoto quando su apre il modal

  function resetAll(){
    setDataScadenza("");
    setAzienda("");
    setFile("");
    setContatti([]);
    setSendToMe(true);
    setContatti([{
      name: "",
      email: "",
      number: "",
      id: uuidv4(),
    },]);
  }

  function addNewContact() {
    let oldContatti = contatti.filter((x) => {
      if ((x.name && x.email) || (x.name && x.number)) return x;
    });

    if (!oldContatti[0]) return console.log("impossibile aggiungere ");

    if (oldContatti.length < contatti.length)
      return console.log("impossibile aggiungere");
    setContatti([
      ...contatti,
      {
        name: "",
        email: "",
        number: "",
        id: uuidv4(),
      },
    ]);
  }


  function onChangeInput(x) {
    const found = contatti.find((contatto) => contatto.id === x.id);
    found[x.field] = x.value;

    const indexToPop = contatti.indexOf(found);
    let tmp = [...contatti];
    tmp.splice(indexToPop, 1, found);

    // console.log(tmp[0]);
    setContatti(tmp);
  }

  function popLast() {
    let tmp = [...contatti];
    tmp.pop();
    setContatti(tmp);
  }

  function handleFile(file) {
    if (!file) return;

    setFile(file.path);
  }

  function handleDate(date) {
    if (!date) return;

    let parsedDate = moment(date, "YYYY-MM-DD");
  

    // let dayDiff = parsedDate.diff(moment().format("YYYY-MM-DD"), "days");
    // if (dayDiff < 15) {
    //   return window.api.showErrorDialog(
    //     "Devono esserci almeno 15 giorni di distanza tra oggi e la scadenza",
    //   );
    // } else {
      setDataScadenza(parsedDate.format("DD-MM-YYYY"));
    // }
  }

  function confirm() {
    if (!azienda) return window.api.showErrorDialog(
        "Manca il nome di un riferimento o dell'azienda",
      );
    if(!file) return window.api.showErrorDialog(
      "Manca il file allegato",
    );
    const requireds = contatti.map((x) => [
      x.name && x.email != "",
      x.name && x.number != "",
    ]);

    let response = requireds.map((x) => {
      return x.includes(true);
    });

    let allHaveEmailOrPassword = response.every((x) => x == true);

    if (!allHaveEmailOrPassword) {
      let index = response.indexOf(false) + 1;
      window.api.showErrorDialog(
        `Qualcosa è andato storto, sembra che manchino alcune informazioni del contatto alla posizione ${index}, assicurati che ci sia il nome ed almeno uno tra il numero e l'email`,
      );
    }else{
      if (!dataScadenza) return window.api.showErrorDialog("Manca la data di scandeza");

      let payload = {
        scadenza:dataScadenza,
        azienda:azienda,
        contatti:contatti,
        selfNotify:sendToMe
    }
    if(file) payload.file = file
  
      window.api.addRef(JSON.stringify(payload)).then(res=>{
        if(res.status == "success"){
          updateRefs();
          toggleModal();
          window.api.showNotification("Successo","Riferimento aggiunto con succeso")
        }else{
          window.api.showErrorDialog(`Si è verificato un errore durante il salvataggio della referenza, errore: ${res.message}`)
        }
      }).catch(err=>{
        console.log(err);
      });
    }

   
  }


 

  return (
    <Modal onShow={resetAll} scrollable fullscreen centered show={visible}>
      <Modal.Body>
        <br />
        <Form.Group>
          <Form.Control
            value={azienda}
            onChange={(e) => setAzienda(e.target.value)}
            placeholder="Nome o riferimento all'azienda"
          />
        </Form.Group>
        <Form.Group>
          <br />

          <div
            style={{
              padding: 10,
              marginRight: 10,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
            }}
          >
            <p style={{ margin: 0 }}>
              <span style={{ marginRight: 10 }}>Aggiungi un contatto</span>
              <Badge onClick={addNewContact}>+</Badge>
            </p>
            <span>
              <Form.Check
                checked={sendToMe}
                onChange={(e) => setSendToMe(!sendToMe)}
                value={sendToMe}
                style={{ display: "inline", marginRight: 10 }}
              />
              <span>Invia anche a me</span>
            </span>
          </div>

          {contatti.map((contatto, index) => (
            <ContactAccordion
              popLast={popLast}
              isLast={
                contatti.length > 1 ? index == contatti.length - 1 : false
              }
              onChangeInput={onChangeInput}
              body={contatto}
              title={contatto.name}
            />
          ))}
        </Form.Group>

        <br />

        <FileUpload handleFile={handleFile} />

        <br />

        <Datepicker handleDate={handleDate} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" onClick={confirm}>
          Conferma
        </Button>
        <Button variant="danger" onClick={toggleModal}>
          Annulla
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AddModal;
