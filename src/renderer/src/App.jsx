import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect } from "react";
import moment from "moment";

// componenti
import Navbar from "./components/Navbar.jsx";
import ListItem from "./components/ListItem.jsx";

// ! modals
import AddModal from "./components/AggiungiModal.jsx";
import NotificheModal from "./components/NotificheModal.jsx";
import { Button } from "react-bootstrap";

function App() {
  let [refs, setRefs] = useState([]);
  let [addModalVIsible, setAddModalVisible] = useState(false);
  let [notificationModalVisible, setNotificationModalVisible] = useState(false);
  let [scadenzeMap, setScadenzeMap] = useState([]);
  let [onlyClosed, setOnlyClosed] = useState(false);

  let [dateFilter, setDateFilter] = useState([]);

  function updateRefs() {
    window.api
      .fetchRefs()
      .then((res) => {
        // console.log(JSON.parse(res));
        setRefs(JSON.parse(res));
      })
      .catch((err) => {
        console.log("err: ", err);
      });
  }

  useEffect(() => {
    updateRefs();
    setDateFilter([...refs]);
  }, []);

  function toggleAddModal() {
    setAddModalVisible(!addModalVIsible);
  }

  function toggleNotificationModal() {
    setNotificationModalVisible(!notificationModalVisible);
  }

  function remRef(id) {
    window.api
      .remRef(id)
      .then((res) => {
        if (res.status == "error")
          return window.api.showErrorDialog(
            `Errore durante la lettura risposta della cancellazione del riferimento ${id}, errore: ${err.message}`,
          );

        updateRefs();
      })
      .catch((err) => {
        window.api.showErrorDialog(
          `Errore durante la lettura risposta della cancellazione del riferimento ${id}, errore: ${err.message}`,
        );
      });
  }

  function isToNotyify(x, notified) {
    return x.isSameOrBefore(moment(moment(), "DD-MM-YYYY")) && !notified;
  }

  function getToNotify() {
    let heap = [];

    let tmp = refs.filter((ref) => {
      const x = moment(ref.scadenza, "DD-MM-YYYY");

      const primaScadenza = x.clone().subtract(15, "days");
      const secondaScadewnza = x.clone().subtract(7, "days");
      const terzaScadenza = x.clone();

      if (
        isToNotyify(primaScadenza, ref.notificato[0]) ||
        isToNotyify(secondaScadewnza, ref.notificato[1]) ||
        isToNotyify(terzaScadenza, ref.notificato[2])
      )
        return ref;
    });
    if (!tmp.length) return [];

    tmp.map((y) => {
      const x = moment(y.scadenza, "DD-MM-YYYY");
      let scadenze = y.notificato;
      const primaScadenza = x.clone().subtract(15, "days");
      const secondaScadewnza = x.clone().subtract(7, "days");
      const terzaScadenza = x.clone();

      heap.push({
        azienda: y.azienda,
        id: y._id,
        file: y.file,
        contatti: y.contatti,
        scadenza: y.scadenza,
        selfNotify: y.selfNotify,
        scadenze: [
          {
            data: primaScadenza.clone().format("DD-MM-YYYY"),
            notificato: scadenze[0],
            daNotificare: isToNotyify(primaScadenza),
          },
          {
            data: secondaScadewnza.clone().format("DD-MM-YYYY"),
            notificato: scadenze[1],
            daNotificare: isToNotyify(secondaScadewnza),
          },
          {
            data: terzaScadenza.clone().format("DD-MM-YYYY"),
            notificato: scadenze[2],
            daNotificare: isToNotyify(terzaScadenza),
          },
        ],
      });
    });

    // setToNotifyIndex(indexToNotify)
    return heap;
  }

  useEffect(() => {
    let r = getToNotify();
    // console.log(r);
    // if (!refs.length) return;
    setScadenzeMap(r);
    setDateFilter([...refs]);
  }, [refs]);

  function handleDateFilterChange(dat) {
    let selectedToFix = moment(dat, "DD-MM-YYYY");
    let tmp = refs.filter((x) => {
      return moment(x.scadenza, "DD-MM-YYYY").isSameOrBefore(selectedToFix);
    });
    setDateFilter([...tmp]);
  }

  useEffect(() => {
    if (onlyClosed) {
      let tmp = refs.filter((x) => x.closed === true);
      setDateFilter([...tmp]);
    }else{
      setDateFilter([...refs]);
    }
  }, [onlyClosed]);

  return (
    <div id="main" style={{ background: "gainsboro" }}>
      <Button
        onClick={() => setOnlyClosed(!onlyClosed)}
        style={{ position: "absolute", bottom: 10, right: 10 }}
      >
        {onlyClosed ? "Mostra tutti" : "Mostra solo chiusi"}
      </Button>
      <Navbar
        toggleAddModal={toggleAddModal}
        toggleNotificationModal={toggleNotificationModal}
        notifiche={scadenzeMap.length}
        handleDateFilterChange={handleDateFilterChange}
      />
      <main
        style={{
          background: "white",
          height: "90%",
          width: "60%",
          padding: 20,
          marginRight: "20%",
          marginLeft: "20%",
        }}
      >
        {dateFilter
          ? dateFilter.map((x) => {
              return <ListItem remRef={remRef} data={x} />;
            })
          : "loading.."}
      </main>
      <AddModal
        updateRefs={updateRefs}
        toggleModal={toggleAddModal}
        visible={addModalVIsible}
      />
      <NotificheModal
        toggleNotificationModal={toggleNotificationModal}
        visible={notificationModalVisible}
        scadenzeMap={scadenzeMap}
        updateRefs={updateRefs}
      />
    </div>
  );
}

export default App;
