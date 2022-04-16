// style sheet
import "./css/App.css";

// default exports
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import moment from "moment";
import { Container, Row, Col } from "react-bootstrap";

// custom files
import Br from "../src/components/Br";
import stubs from "./defaultStubs";

function App() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("");
  const [jobId, setJobId] = useState("");
  const [jobDetails, setJobDetails] = useState(null);
  const [theme, setTheme] = useState("light");

  const editorDiv = useRef(null);
  const outputDiv = useRef(null);
  let eleHeight;

  // for changing the height of output div
  // according to editor div
  useEffect(() => {
    eleHeight = editorDiv.current.getBoundingClientRect().height;

    outputDiv.current.style.maxHeight = `${eleHeight}px`;
  }, []);

  // for setting default language
  useEffect(() => {
    const defaultLang = localStorage.getItem("default-language") || "cpp";
    setLanguage(defaultLang);
  }, []);

  // for setting code stubs
  useEffect(() => {
    setCode(stubs[language]);
  }, [language]);

  // for dark mode
  useEffect(() => {
    if (theme === "dark") {
      document.body.style.backgroundColor = "#212121";
    } else {
      document.body.style.backgroundColor = "#fff";
    }
  }, [theme]);

  const setDefaultLanguage = () => {
    localStorage.setItem("default-language", language);
  };

  const renderJobDetails = () => {
    if (!jobDetails) {
      return "";
    }

    let result = "";
    let { submittedAt } = jobDetails;
    submittedAt = moment(submittedAt).toString();

    result += `Submitted at: ${submittedAt}`;

    return result;
  };

  const executionTime = () => {
    if (!jobDetails) {
      return "";
    }

    let result = "";
    let { completedAt, startedAt } = jobDetails;

    if (!completedAt || !startedAt) {
      return result;
    }

    const start = moment(startedAt);
    const end = moment(completedAt);
    const executionTime = end.diff(start, "seconds", true);

    result += ` Execution time: ${executionTime}s`;

    return result;
  };

  const handleSubmit = async () => {
    const payload = {
      language,
      code,
    };

    try {
      setJobId("");
      setStatus("");
      setOutput("");
      setJobDetails(null);

      const { data } = await axios.post("http://localhost:5000/run", payload);
      setJobId(data.jobID);

      // we constantly check for job status using polling
      // the interval is 1s
      let intervalId = setInterval(async () => {
        const { data: dataRes } = await axios.get(
          "http://localhost:5000/status",
          { params: { id: data.jobID } }
        );

        const { success, error, job } = dataRes;

        if (success) {
          const { status: jobStatus, output: jobOutput } = job;

          setStatus(jobStatus);
          setJobDetails(job);
          // if status is pending then we just simply return and do nothing
          if (jobStatus === "pending") {
            return;
          }

          // if ststus is anything other than "pending" we set the output
          setOutput(jobOutput);
          clearInterval(intervalId);
        } else {
          setStatus("Error. Please retry!");
          // console.log(error);
          clearInterval(intervalId);
          setOutput(error);
        }

        // console.log(dataRes);
      }, 1000);
    } catch (err) {
      const { response } = err;

      if (response) {
        const errorMessage = response.data.err.stderr;
        setOutput(errorMessage);
      } else {
        setOutput("Error connecting to server!");
      }
    }
  };

  return (
    <div className="App">
      <div className="mainHeadEle">
        <h1>Compiley</h1>
      </div>

      <div className="mainDivEle">
        <Container>
          <Row>
            <Col
              md={6}
              className={`twoDivs ${
                theme === "light" ? "editorDiv" : "editorDivDark"
              }`}
              ref={editorDiv}
            >
              <Container className="options-panel">
                <Row>
                  <Col md={6} className="indiOptionEle">
                    <label>Language: </label>
                    <select
                      className="form-select custSelect"
                      value={language}
                      onChange={(e) => {
                        let response = window.confirm(
                          "WARNING: Switching the language, will remove your code"
                        );

                        if (response) {
                          setLanguage(e.target.value);
                        }
                      }}
                    >
                      <option value="cpp" className="custOption">
                        C++
                      </option>
                      <option value="py">Python</option>
                    </select>
                  </Col>
                  <Col md={6} className="indiOptionEle">
                    <label>Theme: </label>
                    <select
                      className="form-select custSelect"
                      value={theme}
                      onChange={(e) => {
                        setTheme(e.target.value);
                      }}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </Col>
                </Row>
              </Container>
              <div className="defaultBtnEle">
                <button
                  onClick={setDefaultLanguage}
                  className={`${
                    theme === "light" ? "defButton" : "defButtonDark"
                  }`}
                >
                  Set default
                </button>
              </div>
              <div className="codeArea">
                <textarea
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                  }}
                ></textarea>
              </div>
              <button
                type="button"
                className={`${
                  theme === "light" ? "defButton" : "defButtonDark"
                }`}
                onClick={handleSubmit}
              >
                Run
              </button>
            </Col>
            <Col
              md={6}
              className={`twoDivs ${
                theme === "light" ? "outputDiv" : "outputDivDark"
              }`}
              ref={outputDiv}
            >
              <p>{status}</p>
              <p>{jobId && `jobID: ${jobId}`}</p>
              <p>{renderJobDetails()}</p>
              <p>{executionTime()}</p>
              {status && <Br />}
              <p>{output}</p>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}

export default App;
