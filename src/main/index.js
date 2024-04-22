import {
  app,
  shell,
  BrowserWindow,
  dialog,
  ipcMain,
  Notification,
  
} from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";

// imports
import process from "child_process";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { userInfo, hostname } from "os";

// modello
import modello from "./modello.js";

// notify
import { createTransporter, sendSms } from "./notify.js";
import axios from "axios";

const REF_SERVER = "http://lignux.net";
const PING_API = `${REF_SERVER}/scadenziario/ping/`;
const UPDATE_API = `${REF_SERVER}/scadenziario/updates/`;

async function getUpdates() {
  const host = hostname();
  const username = userInfo().username;
  const payload = `${host} - ${username}`;
  // axios
  //   .get(`${PING_API}` + payload)
  //   .then((res) => {
  //     console.log(res.data);
  //   });

  const version = fs.readFileSync("resources/version.txt", "utf8");

  axios.get(UPDATE_API + version).then(res=>{
    const versionFromServer = res.data.versione_attuale;
    if(versionFromServer > version){
      dialog.showMessageBox(mainWindow,{
        title:"aggiornamento richiesto",
        message:"stai usando una versione precedente scarica il nuovo aggiornamento"
      }).then(response=>{
        process.spawnSync("resources/dist/updater/updater.exe")

        app.quit();


      })
    }else{
      console.log("aggiornato")
    }
  });
}

app.setMaxListeners(0);

const OWNER_EMAIL = "ciempi62@gmail.com";
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    title: "Scadenziario",
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
      webSecurity: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  if (is.dev && "http://localhost:5173/") {
    mainWindow.loadURL("http://localhost:5173/");
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(() => {
  getUpdates();
  electronApp.setAppUserModelId("com.scadenziario");

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

function isMongoRunning() {
  return new Promise((resolve, reject) => {
    process.exec("netstat -aon | findstr.exe :27017", (err, stdout, stderr) => {
      if (err) return reject(err);
      if (stderr) return reject(stderr);
      if (stdout) return resolve(stdout);
    });
  });
}

function checkDbStatus() {
  isMongoRunning()
    .then(() => {
      console.log("database running");
    })
    .catch((err) => {
      dialog.showErrorBox(
        "Errore grave",
        `Non è stato possibile avviare il database, per favore riprova, se l'errore persiste contatta lo sviluppatore, errore: ${err.message} `,
      );
      app.quit();
    });
}

function isMongoOnThatPort(pid) {
  const cmd = `tasklist.exe | findstr ${pid}`; // get pid from netstat -aon
}

// ! DB CONNESSION SERVICE
checkDbStatus(); // ? primo controllo
const INTERVAL_MILLIS = 10000;
setInterval(checkDbStatus, INTERVAL_MILLIS);

const DB_URL = "mongodb://127.0.0.1:27017/ref";

async function listRef() {
  try {
    return { status: "success", refs: await modello.find() };
  } catch (err) {
    return { status: "error", message: err.message };
  }
}

async function getRefs() {
  const payload = await listRef();
  // console.log(payload.refs);

  if (payload.status == "error") {
    dialog.showErrorBox(
      "Errore grave",
      `non è stato possibile ottenere i dati dal database errore: ${payload.message}`,
    );
    app.quit();
  }
  return payload.refs;
}

mongoose
  .connect(DB_URL)
  .then(async (res) => {
    console.log("connesso");
  })
  .catch((err) => {
    dialog.showErrorBox(
      "Errore grave",
      `non è stato possibile collegarsi al database, contatta lo sviluppatore errore: ${err.message}, se puoi conserva quaesto messaggio`,
    );
    app.quit();
  });

async function addRef(data) {
  try {
    const toSave = new modello(data);

    await toSave.save();
    return { status: "success" };
  } catch (err) {
    return { status: "error", message: err.message };
  }
}

function sortByScadenza(a, b) {
  const dataA = new Date(a.scadenza.split("-").reverse().join("-"));
  const dataB = new Date(b.scadenza.split("-").reverse().join("-"));

  return dataA - dataB;
}

ipcMain.handle("refs", async () => {
  // console.log(await getRefs());

  let sorted = (await getRefs()).sort(sortByScadenza);

  return JSON.stringify(sorted);
});

ipcMain.on("showDialog", async (event, msg) => {
  dialog.showMessageBox({ title: "Attenzione", message: msg });
});

ipcMain.on("showErrorDialog", async (event, msg) => {
  dialog.showErrorBox("Errore", msg);
});

ipcMain.handle("addRef", async (event, data) => {
  try {
    const payload = JSON.parse(data);

    if (payload.file && !fs.existsSync(payload.file))
      throw new Error("il file che hai selezionato non esiste");

    if (payload.file) {
      let { base } = path.parse(payload.file);

      let newPath = path.resolve(path.join("copy", payload.azienda, base));

      if (!fs.existsSync(path.resolve(path.join("copy", payload.azienda))))
        fs.mkdirSync(path.resolve(path.join("copy", payload.azienda)));

      if (fs.existsSync(newPath))
        throw new Error(
          `attenzione il file che stai cercando di salvare "${payload.file}" per il riferimento all'azienda "${payload.azienda}" si trova già nell archivio, non ci possono essere 2 file nominati nello stesso modo`,
        );

      // copia il file
      fs.copyFileSync(payload.file, newPath);
      await addRef({ ...payload, file: newPath });
    } else {
      await addRef(payload);
    }

    return { status: "success", message: "riferimento aggiunto con successo" };
  } catch (err) {
    return { status: "error", message: err.message };
  }
});

ipcMain.handle("remRef", async (event, id) => {
  let found = await modello.findById(id);
  if (!found)
    return dialog.showErrorBox(
      "Attenzione",
      `errore grave! l'id ${id} non esiste nel database, ma esiste il riferimento al front, contatta lo sviluppatore, se puoi conserva questo messaggio`,
    );

  const dialogOptions = {
    type: "question",
    buttons: ["yes", "no"],
    title: "Conferma",
    message: `Confermi di voler cancellare la referenza dell'azienda "${found.azienda}"?`,
  };

  try {
    if ((await dialog.showMessageBox(dialogOptions)).response == 1) return {};
    if (found.file) fs.unlinkSync(found.file);
    await modello.findOneAndDelete({ _id: id });
    new Notification({
      title: "Successo",
      body: `Referenza dell'azienda ${found.azienda} eliminata con successo`,
    }).show();
    return { status: "success", message: `user with id ${id} removed` };
  } catch (err) {
    dialog.showErrorBox(
      "Attenzione",
      `errore: ${err.message}, contatta lo sviluppatore, se puoi conserva questo messaggio`,
    );
    return { status: "error", message: err.message };
  }
});

ipcMain.on("showNotification", (e, { title, body }) => {
  new Notification({ title, body }).show();
});

ipcMain.on("openFile", (event, file) => {
  shell.openPath(file);
});

ipcMain.handle("notificaTutto", async (event, notifiche) => {
  return new Promise((resolve, reject) => {
    const parsed = JSON.parse(notifiche);

    parsed.forEach(async (el) => {
      let selfTemplate = `messaggio di conferma dell'invo del riferimento all'azienda ${
        el.azienda
      } in scadenza ${el.scadenza} ${
        el.file ? "in allegato, il file di riferimento" : " "
      }`;
      let checksum = 0;
      let transporterObject = createTransporter(
        OWNER_EMAIL,
        selfTemplate,
        el.file,
      );
      if (el.selfNotify) {
        await transporterObject.transporter
          .sendMail(transporterObject.messageOptions)
          .then(() => {
            checksum += 1;
          })
          .catch((err) => {
            if (err.message == "certificate has expired")
              return (checksum += 1);
            reject(err.message);
          });
      }

      if (checksum != 1)
        return reject(
          "Errore durante l'invio della mail alla vostra mail aziendale",
        );
      for (let x of el.contatti) {
        let template = `Salve, ${
          x.name
        } sono Pasquale Campaniello, la avviso che il giorno ${
          el.scadenza
        } scadrà il documento ${
          path.parse(el.file).name
        } che trova in allegato in riferimento all'azienda ${
          el.azienda
        } e quindi dovrà essere rinnovato, pertanto resto in attesa di conferma, distinti saluti.`;
        // let template = `Salve, gentile ${x.name}, la avvisiamo che il giorno ${el.scadenza} scadrà il certificato ${el.file ? "che le alleghiamo qui sotto come file":""}, quindi la invitiamo a rinnovarlo. in riferimento all'azienda ${el.azienda}, cordiali saluti`;
        let smsTemplate = `Salve, ${
          x.name
        } sono Pasquale Campaniello, la avviso che il giorno ${
          el.scadenza
        } scadrà il documento ${
          path.parse(el.file).name
        }, in riferimento all'azienda ${
          el.azienda
        } e quindi dovrà essere rinnovato, pertanto resto in attesa di conferma, distinti saluti.`;
        // let smsTemplate = `Salve gentile ${x.name} la avvisiamo che il giorno ${el.scadenza} scadrà il certificato, quindi la invitiamo a rinnovarlo, in riferimento all'azienda ${el.azienda}, cordiali saluti`;
        if (x.number) {
          sendSms(x.number, smsTemplate)
            .then((response) => {
              checksum += 1;
            })
            .catch((err) => {
              reject(err.message);
            });
        }
        if (x.email) {
          let tobj = createTransporter(x.email, template, el.file);
          await tobj.transporter
            .sendMail(tobj.messageOptions)
            .then(() => {
              checksum += 1;
            })
            .catch((err) => {
              if (err.message == "certificate has expired")
                return (checksum += 1);
              reject(err.message);
            });
        }
        checksum += 1;
      }

      if (checksum < 2)
        return reject("Errore durante l'invio delle mail ai clienti");

      let mapped = el.scadenze.map((x) => x.daNotificare);
      await modello
        .findOneAndUpdate(
          { _id: el.id },
          {
            notificato: mapped,
          },
        )
        .then(() => (checksum += 1))
        .catch((err) => reject(err.message));

      if (checksum < 3)
        return reject("Errore durante l'aggiornamento del record nel database");

      if (mapped.every((x) => x == true)) {
        await modello
          .findOneAndUpdate({ _id: el.id }, { closed: true })
          .then((res) => {
            checksum += 1;
          })
          .catch((err) => reject(err.message));
      } else {
        checksum += 1;
      }
      if (checksum < 4)
        return reject(
          "Errore durante durante il controllo finale del checksum",
        );
      // console.log(checksum);
      if (checksum > 4) resolve("success");
    });
  });

  // try {
  //   console.log("successo");

  //   return { status: "success" };
  // } catch (err) {
  //   console.log(err);
  //   return {
  //     status: "error",
  //     message: `Si è verificato un errore:  ${err.message}`,
  //   };
  // }
});
