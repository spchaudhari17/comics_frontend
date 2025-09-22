import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ComicGenerator.scss';
import Select from "react-select";
import { Row, Col, Form, OverlayTrigger, Tooltip, Modal, Button, Spinner, Alert, Toast } from 'react-bootstrap';
import API from "../../API/index";
import { useDispatch } from "react-redux";
import { setComicStatus } from '../../redux/actions/comicActions';
import { useLocation } from "react-router-dom";


const Stepper = ({ currentStep }) => {
  const steps = [
    "Write a story",
    "Concept Breakdown",
    "Convert into Prompt",
    "Preview My Comic",
    "Publish My Comic",
  ];

  return (
    <div className="stepper-wrapper position-relative mb-5">
      <div className="stepper-line position-absolute start-0 end-0 z-0" />
      <div className="stepper-line stepper-line-progress position-absolute bg-primary z-1"
        style={{
          width: `${(currentStep / (steps.length - 1)) * 100}%`,
          transition: "width 0.3s ease",
        }}
      />
      <div className="stepper d-flex justify-content-between position-relative z-1">
        {steps.map((label, index) => (
          <div key={index} className={`step text-center position-relative ${index === currentStep ? "active" : ""} ${index < currentStep ? "completed" : ""}`}>
            <div className="step-number d-flex align-items-center justify-content-center">
              {index + 1}
            </div>
            <div className="step-label position-absolute top-100 start-50 translate-middle-x text-nowrap mt-1">
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ComicGenerator = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const resumeComicId = location.state?.comicId;


useEffect(() => {
  if (resumeComicId) {
    const loadComic = async () => {
      try {
        const { data } = await API.get(`/user/comics/${resumeComicId}`);
        setComicId(resumeComicId);

        // Title, concept, subject, story load karo
        if (data.comic?.title) setComicTitle(data.comic.title);
        if (data.comic?.concept) setConcept(data.comic.concept);
        if (data.comic?.subject) setSubject(data.comic.subject);
        if (data.comic?.story) setStory(data.comic.story);

        // Prompt load karo
        if (data.comic?.prompt) {
          setPrompt(JSON.stringify(JSON.parse(data.comic.prompt), null, 2));
        }

        // Agar breakdown parts aaye
        if (data.parts) {
          setParts(data.parts);
        }

        // ✅ Direct Step 1 pe le jao
        setStep(1);
      } catch (err) {
        console.error("Failed to load draft comic:", err);
        setErrorMsg("Could not load draft comic. Please try again.");
      }
    };

    loadComic();
  }
}, [resumeComicId]);


  // flow state
  const [step, setStep] = useState(0);
  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

  // business state
  const [comicId, setComicId] = useState(null);
  const [pages, setPages] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState({});
  const [classGrade, setClassGrade] = useState("");
  const [themeType, setThemeType] = useState("");
  const [styleType, setStyleType] = useState("");
  const [comicTitle, setComicTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [subject, setSubject] = useState("");
  const [story, setStory] = useState("");
  const [prompt, setPrompt] = useState(""); // stringified JSON for display/edit
  const [comicImages, setComicImages] = useState([]); // array of imageUrl
  const [pdfUrl, setPdfUrl] = useState("");
  const [concept, setConcept] = useState("");
  const [series, setSeries] = useState(null);
  const [parts, setParts] = useState([]);
  const [completedParts, setCompletedParts] = useState([]);


  // ui state
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [existingComic, setExistingComic] = useState(null);


  // Style Images Modal
  const [showStyleImgModal, setShowStyleImgModal] = useState(false);
  const opneStyleImgModal = () => setShowStyleImgModal(true);
  const closeStyleImgModal = () => setShowStyleImgModal(false);

  const openStyleImgModal = () => {
    if (styleType) {
      setShowStyleImgModal(true);
    } else {
      alert("Please select a style first!");
    }
  };
  // Example style → image mapping

  const resetAfterBackToPrompt = () => {
    // user goes back to prompt to edit/regenerate → clear images & pdf
    setComicImages([]);
    setPdfUrl("");
  };

  // STEP 1: Story → Prompt (backend returns comicId + pages)
  const handleConvertToPrompt = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoadingPrompt(true);

    try {
      const { data } = await API.post("/user/refine-prompt", {
        title: comicTitle,
        author,
        subject,
        subjectId: subject,
        concept,
        story,
        themeId: themes.find(t => t.name === themeType)?._id,
        styleId: styles.find(s => s.name === styleType)?._id,
        grade: classGrade,
        country: selectedCountry?.value
      });

      if (data.alreadyExists) {
        setExistingComic(data.series); // series already exists
        return;
      }

      if (!data?.parts || !Array.isArray(data.parts)) {
        throw new Error("Invalid response: no parts found");
      }

      setSeries(data.series);
      setParts(data.parts);
      setStep(1); // go to breakdown step
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.response?.data?.error || "Prompt refinement failed.");
    } finally {
      setLoadingPrompt(false);
    }
  };


  // STEP 2: Prompt → Images (backend returns array of { page, imageUrl })
  const handleGenerateComic = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoadingImage(true);

    try {
      // If user edited prompt JSON in textarea, re-parse safely
      let finalPages = pages;
      try {
        const maybeParsed = JSON.parse(prompt);
        if (Array.isArray(maybeParsed)) {
          finalPages = maybeParsed;
          setPages(maybeParsed);
        }
      } catch {
        // keep previous pages if textarea text isn't valid JSON
      }

      const { data } = await API.post("/user/generate-comic", {
        comicId,
        pages: finalPages,
      });

      const imgs = (data?.images || []).map((it) => it.imageUrl).filter(Boolean);
      if (imgs.length === 0) {
        throw new Error("No images generated.");
      }

      setComicImages(imgs);
      nextStep();
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.response?.data?.error || err.message || "Error generating comic images.");
    } finally {
      setLoadingImage(false);
    }
  };

  // STEP 3: Publish → Backend PDF (returns S3 url)
  const handlePublishComic = async () => {
    setErrorMsg("");
    setPublishing(true);
    try {
      const { data } = await API.post("/user/generateComicPDF", { comicId });
      if (!data?.pdfUrl) throw new Error("PDF URL not returned");
      setPdfUrl(data.pdfUrl);
      nextStep();
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.response?.data?.error || "Failed to publish comic.");
    } finally {
      setPublishing(false);
    }
  };

  // STEP 4: to publish comic
  // 1️⃣ LocalStorage se restore on mount
  useEffect(() => {
    const saved = localStorage.getItem("currentSeries");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSeries(parsed.series);
      setParts(parsed.parts);
      setCompletedParts(parsed.completedParts || []);
    }
  }, []);

  // 2️⃣ LocalStorage me save whenever parts/completedParts change
  useEffect(() => {
    if (parts.length > 0) {
      localStorage.setItem(
        "currentSeries",
        JSON.stringify({ series, parts, completedParts })
      );
    }
  }, [series, parts, completedParts]);

  // 3️⃣ handlePublish update
  const handlePublish = () => {
    dispatch(setComicStatus(comicId, "published"));

    // mark current part as completed
    setCompletedParts((prev) => [...new Set([...prev, comicId])]);

    // ✅ redirect back to Concept Breakdown (Step 1)
    setStep(1);
  };


  // helpers
  const isStep0Valid = story?.trim()?.length > 0 && comicTitle.trim() && subject.trim();


  // quiz states
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizId, setQuizId] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const [quizData, setQuizData] = useState({});
  const [faqData, setFaqData] = useState({});
  const [factData, setFactData] = useState({});


  // Generate Quiz
  const handleGenerateQuiz = async () => {
    setQuizLoading(true);
    try {
      const { data } = await API.post("/user/generate-quiz", { comicId, script: story });
      setQuizData(prev => ({
        ...prev,
        [comicId]: data.questions || []
      }));
    } catch (err) {
      setQuizError(err?.response?.data?.error || "Failed to generate quiz");
    } finally {
      setQuizLoading(false);
    }
  };



  // For react-select country selection
  useEffect(() => {
    fetch(
      "https://valid.layercode.workers.dev/list/countries?format=select&flags=true&value=code"
    )
      .then((response) => response.json())
      .then((data) => {
        setCountries(data.countries);
        setSelectedCountry(data.userSelectValue);
      });
  }, []);
  // For react-select country selection

  // FAQ states
  const [faqs, setFaqs] = useState([]);
  const [faqLoading, setFaqLoading] = useState(false);
  const [faqError, setFaqError] = useState("");

  // Did You Know states
  const [facts, setFacts] = useState([]);
  const [factLoading, setFactLoading] = useState(false);
  const [factError, setFactError] = useState("");

  // Handle Generate FAQs
  const handleGenerateFAQs = async () => {
    setFaqLoading(true);
    try {
      const { data } = await API.post("/user/generate-faqs", { comicId, story: pages });
      setFaqData(prev => ({
        ...prev,
        [comicId]: data.faqs || []
      }));
    } catch (err) {
      setFaqError(err?.response?.data?.error || "Failed to generate FAQs");
    } finally {
      setFaqLoading(false);
    }
  };



  // Handle Generate Did You Know
  const handleGenerateFacts = async () => {
    setFactLoading(true);
    try {
      const { data } = await API.post("/user/generate-didyouknow", {
        comicId,
        subject,
        story,
      });
      setFactData(prev => ({
        ...prev,
        [comicId]: data.didYouKnow || []
      }));
    } catch (err) {
      setFactError(err?.response?.data?.error || "Failed to generate facts");
    } finally {
      setFactLoading(false);
    }
  };



  const [themes, setThemes] = useState([]);
  const [styles, setStyles] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [themesRes, stylesRes, subjectsRes] = await Promise.all([
          API.get("/user/getAllThemes"),
          API.get("/user/getAllStyles"),
          API.get("/user/getallSubject"),
        ]);

        setThemes(themesRes.data || []);
        setStyles(stylesRes.data || []);
        const subjectNames = subjectsRes.data.map(sub => sub.name);
        // setSubjectsList(subjectNames);
        setSubjectsList(subjectsRes.data || []);
      } catch (err) {
        console.error("Error fetching themes, styles, or subjects:", err);
      }
    };

    fetchData();
  }, []);







  // Theme Description Modal
  const [showThemeModal, setShowThemeModal] = useState(false);
  const openThemeModal = () => {
    if (themeType) {
      setShowThemeModal(true);
    } else {
      // alert("Please select a theme first!");

    }
  };
  const closeThemeModal = () => setShowThemeModal(false);


  return (
    <div className="homePage py-5">
      <div className="container-xl">
        <div className="custom-wrapper mx-auto" style={{ maxWidth: "1000px" }}>
          <div className="wrapper pb-1">
            <Stepper currentStep={step} />
          </div>

          {/* Debug Step Control (optional for development) */}
          <div className="d-flex gap-2 mb-3">
            <Button variant="outline-primary" onClick={() => setStep(0)}>Step 0: Story</Button>
            <Button variant="outline-primary" onClick={() => setStep(1)}>Step 1: Prompt</Button>
            <Button variant="outline-primary" onClick={() => setStep(2)}>Step 2: Preview</Button>
            <Button variant="outline-primary" onClick={() => setStep(3)}>Step 3: Publish</Button>
          </div>

          <div className="content-wrapper bg-theme1 border rounded-3 px-3 py-4 p-md-5">
            {errorMsg && (
              <Alert variant="danger" className="mb-4">
                {errorMsg}
              </Alert>
            )}




            {/* STEP 0: Story */}
            {step === 0 && (
              <Form onSubmit={handleConvertToPrompt}>
                <div className="heading-wrapper text-dark mb-4">
                  <div className="fs-3 fw-bold">Write your story</div>
                </div>
                <Row className="g-3">
                  <Col sm={6} md={4}>
                    <Form.Group>
                      <Form.Label>Country</Form.Label>
                      <Select className="custom-select"
                        options={countries}
                        value={selectedCountry}
                        onChange={(selectedOption) => setSelectedCountry(selectedOption)}
                        placeholder="Select a country"
                        isSearchable
                      />
                    </Form.Group>
                  </Col>
                  <Col sm={6} md={4}>
                    <Form.Group>
                      <Form.Label>Class/Grade</Form.Label>
                      <Form.Select
                        value={classGrade}
                        onChange={(e) => setClassGrade(e.target.value)}
                      >
                        <option value="" disabled>Select Class/Grade</option>
                        <option value="1st Standard">1st Grade </option>
                        <option value="2nd Standard">2nd Grade</option>
                        <option value="3rd Standard">3rd Grade</option>
                        <option value="4th Standard">4th Grade</option>
                        <option value="5th Standard">5th Grade</option>
                        <option value="6th Standard">6th Grade</option>
                        <option value="7th Standard">7th Grade</option>
                        <option value="8th Standard">8th Grade</option>
                        <option value="9th Standard">9th Grade</option>
                        <option value="10th Standard">10th Grade</option>
                        <option value="11th Standard">11th Grade</option>
                        <option value="12th Standard">12th Grade</option>
                        <option value="UG">UG</option>
                        <option value="PG">PG</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col sm={6} md={4}>

                    {/* old subjects */}
                    {/* <Form.Group>
                      <Form.Label>Subject</Form.Label>
                      <Form.Select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                      >
                        <option value="" disabled>Select subject</option>
                        <option value="Science">Science</option>
                        <option value="Mythic">Mythic</option>
                        <option value="Fables">Classic Fables</option>
                        <option value="Motivation">Motivation</option>
                      </Form.Select>
                    </Form.Group> */}


                    <Form.Group>
                      <Form.Label>Subject</Form.Label>
                      <Form.Select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                      >
                        <option value="" disabled>Select subject</option>
                        {/* {subjectsList.map((subName, idx) => (
                          <option key={idx} value={subName}>{subName}</option>
                        ))} */}
                        {subjectsList.map((sub) => (
                          <option key={sub._id} value={sub._id}>{sub.name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>



                  </Col>
                  <Col sm={6} md={4}>



                    <Form.Group>
                      <Form.Label className="d-flex align-items-center gap-2">
                        Theme
                        <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-theme">Select a theme and then click to view</Tooltip>}>
                          <i className="bi bi-info-circle text-primary" role="button" onClick={openThemeModal}></i>
                        </OverlayTrigger>
                      </Form.Label>
                      <Form.Select
                        value={themeType}
                        onChange={(e) => setThemeType(e.target.value)}
                      >
                        <option value="" disabled>Select Theme</option>
                        {themes.map((theme) => (
                          <option key={theme._id} value={theme.name}>{theme.name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>



                  </Col>
                  <Col sm={6} md={4}>

                    <Form.Group>
                      <Form.Label className="d-flex align-items-center gap-2">
                        Choose Style
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip id="tooltip-info">Select a style and then click to view style</Tooltip>}
                        >
                          <i
                            className="bi bi-info-circle text-primary"
                            role="button"
                            onClick={opneStyleImgModal}
                          ></i>
                        </OverlayTrigger>
                      </Form.Label>
                      <Form.Select
                        value={styleType}
                        onChange={(e) => setStyleType(e.target.value)}
                      >
                        <option value="" disabled>Select Style</option>
                        {styles.map((style) => (
                          <option key={style._id} value={style.name}>{style.name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                  </Col>
                  {/* <Col sm={6} md={4}>
                    <Form.Group>
                      <Form.Label>Author</Form.Label>
                      <Form.Control
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="e.g. redu_AI"
                      />
                    </Form.Group>
                  </Col> */}

                  <Col sm={6} md={4}>
                    <Form.Group>
                      <Form.Label>Comic Title</Form.Label>
                      <Form.Control
                        type="text"
                        value={comicTitle}
                        onChange={(e) => setComicTitle(e.target.value)}
                        placeholder="e.g. The Science"
                      />
                    </Form.Group>
                  </Col>

                  <Col sm={6} md={4}>
                    <Form.Group>
                      <Form.Label>Concept</Form.Label>
                      <Form.Control
                        type="text"
                        value={concept}
                        onChange={(e) => setConcept(e.target.value)}
                        placeholder="e.g. photosynthesis"
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label>Write Story</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={6}
                        value={story}
                        onChange={(e) => setStory(e.target.value)}
                        placeholder="Write your story here..."
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <div className="btn-wrapper mt-4 d-flex gap-3">
                  <Button type="submit" disabled={!isStep0Valid || loadingPrompt}>
                    {loadingPrompt ? (<><Spinner size="sm" className="me-2" />Generating prompt...</>) : "Convert to Prompt"}
                  </Button>
                </div>

                {/* STEP: Comic already exists */}
                {existingComic && (
                  <div>
                    <Alert variant="info">
                      A comic for this concept already exists. Here are the details:
                    </Alert>

                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>Country</th>
                          <th>Class / Grade</th>
                          <th>Subject</th>
                          <th>Title</th>
                          <th>Concept</th>
                          <th>PDF</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{existingComic.country}</td>
                          <td>{existingComic.grade}</td>
                          <td>{existingComic.subject}</td>
                          <td>{existingComic.title}</td>
                          <td>{existingComic.concept}</td>
                          <td>
                            {existingComic.pdfUrl ? (
                              <a href={existingComic.pdfUrl} target="_blank" rel="noopener noreferrer">
                                View PDF
                              </a>
                            ) : (
                              "Not published yet"
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="d-flex gap-3 mt-3">
                      <Button variant="primary" onClick={() => navigate("/my-comics")}>
                        Go to My Comics
                      </Button>
                      {/* <Button variant="secondary" onClick={() => setStep(0)}>
                        Create New Comic
                      </Button> */}
                    </div>
                  </div>
                )}


              </Form>
            )}

            {/* STEP 1: Prompt */}
            {step === 1 && (
              <div>
                <div className="fs-3 fw-bold mb-3">Concept Breakdown</div>
                <p className="text-muted">Your concept has been divided into the following parts:</p>

                {parts.length === 0 ? (
                  <Alert variant="warning">No parts returned from backend.</Alert>
                ) : (
                  <div className="d-flex flex-column gap-3">

                    {/* {parts.map((p) => (
                      <div key={p.part} className="p-3 border rounded bg-light">
                        <h5>Part {p.part}: {p.title}</h5>
                        <p><strong>Key Terms:</strong> {p.keyTerms.join(", ")}</p>
                        <p><strong>From:</strong> {p.start} <strong>→</strong> {p.end}</p>

                        <Button
                          variant="primary"
                          onClick={async () => {
                            try {
                              const { data } = await API.get(`/user/comics/${p.comicId}`);
                              setComicId(p.comicId);

                              // ✅ Prompt parse karke textarea me daalo
                              if (data.comic?.prompt) {
                                setPrompt(JSON.stringify(JSON.parse(data.comic.prompt), null, 2));
                              } else {
                                setPrompt(""); // fallback
                              }

                              // ✅ Pages abhi khali hain (kyunki images generate nahi hue),
                              // lekin prompt ke andar sab detail hai
                              setPages(data.pages || []);

                              setStep(2); // move to Prompt editor
                            } catch (err) {
                              console.error("Failed to fetch comic:", err);
                              setErrorMsg("Could not load comic script. Please try again.");
                            }
                          }}
                        >
                          Generate Comic for Part {p.part}
                        </Button>


                      </div>
                    ))} */}

                    {parts.map((p) => {
                      const isDone = completedParts.includes(p.comicId);

                      return (
                        <div key={p.part} className="p-3 border rounded bg-light">
                          <h5>
                            Part {p.part}: {p.title}{" "}
                            {isDone && <span className="badge bg-success">Done</span>}
                          </h5>
                          <p><strong>Key Terms:</strong> {p.keyTerms.join(", ")}</p>
                          <p><strong>From:</strong> {p.start} → {p.end}</p>

                          {!isDone && (
                            <Button
                              variant="primary"
                              onClick={async () => {
                                try {
                                  const { data } = await API.get(`/user/comics/${p.comicId}`);

                                  // ✅ reset states for new part
                                  setComicId(p.comicId);
                                  setComicImages([]);
                                  setSelectedImage(null);
                                  setPdfUrl("");
                                  setPrompt("");
                                  setPages([]);

                                  if (data.comic?.prompt) {
                                    setPrompt(JSON.stringify(JSON.parse(data.comic.prompt), null, 2));
                                  }

                                  // Pages abhi generate nahi hue (empty array rahega)
                                  // user ko pehle "Generate My Comic" click karna padega
                                  setStep(2);
                                } catch (err) {
                                  console.error("Failed to fetch comic:", err);
                                  setErrorMsg("Could not load comic script. Please try again.");
                                }
                              }}
                            >
                              Generate Comic for Part {p.part}
                            </Button>

                          )}

                          {isDone && (
                            <Button
                              variant="outline-secondary"
                              disabled
                            >
                              Already Generated
                            </Button>
                          )}
                        </div>
                      );
                    })}



                  </div>
                )}

                <div className="btn-wrapper mt-4 d-flex gap-3">
                  <Button variant="secondary" onClick={() => setStep(0)}>Back</Button>
                </div>
              </div>
            )}

            {/* STEP 2: Preview images */}
            {/* STEP 2: Preview images */}
            {step === 2 && (
              <div>
                <div className="fs-3 fw-bold mb-3">Preview My Comic</div>

                {/* Agar abhi tak images nahi bani */}
                {comicImages?.length === 0 ? (
                  <Form onSubmit={handleGenerateComic}>
                    <div className="fs-5 fw-semibold mb-2">Comic Script JSON</div>
                    <Form.Group className="mb-3">
                      <Form.Control
                        as="textarea"
                        rows={10}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        spellCheck={false}
                        style={{ fontFamily: "monospace" }}
                      />
                    </Form.Group>

                    <div className="btn-wrapper mt-4 d-flex gap-3">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setStep(1);
                          resetAfterBackToPrompt();
                        }}
                      >
                        Back
                      </Button>

                      <Button type="submit" disabled={!prompt || loadingImage}>
                        {loadingImage ? (
                          <>
                            <Spinner size="sm" className="me-2" /> Generating comic...
                          </>
                        ) : (
                          "Generate My Comic"
                        )}
                      </Button>
                    </div>
                  </Form>
                ) : (
                  /* Agar images generate ho chuki hain */
                  <>
                    <Row>
                      {/* Thumbnails sidebar */}
                      <Col
                        md={3}
                        className="border-end pe-3"
                        style={{ maxHeight: "500px", overflowY: "auto" }}
                      >
                        <div className="d-flex flex-column gap-2">
                          {comicImages.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`comic-${idx}`}
                              onClick={() => setSelectedImage(img)}
                              className={`img-thumbnail ${selectedImage === img ? "border-primary border-3" : ""
                                }`}
                              style={{
                                cursor: "pointer",
                                objectFit: "cover",
                                height: "80px",
                              }}
                            />
                          ))}
                        </div>
                      </Col>

                      {/* Big preview */}
                      <Col
                        md={9}
                        className="d-flex justify-content-center align-items-center"
                      >
                        {selectedImage ? (
                          <img
                            src={selectedImage}
                            alt="selected-comic"
                            style={{
                              maxWidth: "100%",
                              maxHeight: "500px",
                              borderRadius: "8px",
                              border: "2px solid #ccc",
                            }}
                          />
                        ) : (
                          <p className="text-muted">
                            Click on a thumbnail to preview the image.
                          </p>
                        )}
                      </Col>
                    </Row>

                    {/* Buttons */}
                    <div className="btn-wrapper mt-4 d-flex gap-3 justify-content-center">
                      <Button
                        variant="warning"
                        onClick={() => {
                          setStep(1);
                          resetAfterBackToPrompt();
                        }}
                      >
                        Edit / Regenerate
                      </Button>
                      <Button
                        variant="success"
                        onClick={handlePublishComic}
                        disabled={publishing}
                      >
                        {publishing ? (
                          <>
                            <Spinner size="sm" className="me-2" /> Creating PDF...
                          </>
                        ) : (
                          "Generate Comic PDF"
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}




            {/* STEP 3: Publish */}
            {step === 3 && (
              <div className="text-center">
                <h3>Comic Published 🎉</h3>
                {pdfUrl ? (
                  <p className="mt-3">
                    <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                      Open PDF from S3
                    </a>
                  </p>
                ) : (
                  <Alert variant="warning">PDF URL not found. Try publishing again.</Alert>
                )}

                {/* QUIZ Section */}
                <div className="quiz-wrapper mt-5 text-start">
                  <h4>Generate Quiz for this Comic</h4>
                  <Button
                    variant="info"
                    className="mb-3"
                    onClick={handleGenerateQuiz}
                    disabled={quizLoading || quizData[comicId]?.length > 0}
                  >
                    {quizLoading ? "Generating Quiz..." : "Generate Quiz"}
                  </Button>

                  {quizError && <Alert variant="danger">{quizError}</Alert>}

                  {/* {quizQuestions.length > 0 && (
                    <div className="quiz-questions mt-4">
                      {quizQuestions.map((q, idx) => (
                        <div key={idx} className="mb-4 p-3 border rounded">
                          <strong>Q{idx + 1}. {q.question}</strong>
                          <ul className="mt-2">
                            {q.options.map((opt, i) => (
                              <li key={i}>{opt}</li>
                            ))}
                          </ul>
                          <p className="text-success">✔ Correct: {q.correctAnswer}</p>
                          <p className="text-muted">Difficulty: {q.difficulty}</p>
                        </div>
                      ))}

                    </div>
                  )} */}

                  {quizData[comicId]?.length > 0 && (
                    <div className="quiz-questions mt-4">
                      {quizData[comicId].map((q, idx) => (
                        <div key={idx} className="mb-4 p-3 border rounded">
                          <strong>Q{idx + 1}. {q.question}</strong>
                          <ul className="mt-2">
                            {q.options.map((opt, i) => (
                              <li key={i}>{opt}</li>
                            ))}
                          </ul>
                          <p className="text-success">✔ Correct: {q.correctAnswer}</p>
                          <p className="text-muted">Difficulty: {q.difficulty}</p>
                        </div>
                      ))}
                    </div>
                  )}

                </div>

                {/* FAQ Section */}
                <div className="faq-wrapper mt-5 text-start">
                  <h4>Generate FAQs for this Comic</h4>
                  <Button
                    variant="secondary"
                    className="mb-3"
                    onClick={handleGenerateFAQs}
                    disabled={faqLoading || faqData[comicId]?.length > 0}
                  >
                    {faqLoading ? "Generating FAQs..." : "Generate FAQs"}
                  </Button>

                  {faqError && <Alert variant="danger">{faqError}</Alert>}

                  {faqData[comicId]?.length > 0 && (
                    <div className="faq-list mt-4">
                      {faqData[comicId].map((f, idx) => (
                        <div key={idx} className="mb-4 p-3 border rounded bg-light">
                          <div className="d-flex flex-column flex-md-row gap-3 align-items-start">
                            {f.imageUrl && (
                              <img
                                src={f.imageUrl}
                                alt={`faq-${idx}`}
                                className="img-fluid rounded"
                                style={{ maxWidth: "200px", border: "1px solid #ddd" }}
                              />
                            )}
                            <div>
                              <strong>Q{idx + 1}. {f.question}</strong>
                              <p className="mb-1">Ans: {f.answer}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}




                </div>

                {/* Did You Know Section */}
                <div className="fact-wrapper mt-5 text-start">
                  <h4>Generate Did You Know Facts</h4>
                  <Button
                    variant="warning"
                    className="mb-3"
                    onClick={handleGenerateFacts}
                    disabled={factLoading || factData[comicId]?.length > 0}
                  >
                    {factLoading ? "Generating Facts..." : "Generate Facts"}
                  </Button>

                  {factError && <Alert variant="danger">{factError}</Alert>}

                  {factData[comicId]?.length > 0 && (
                    <div className="fact-list mt-4">
                      {factData[comicId].map((f, idx) => (
                        <div key={idx} className="mb-4 p-3 border rounded bg-light">
                          <div className="d-flex flex-column flex-md-row gap-3 align-items-start">
                            {f.imageUrl && (
                              <img
                                src={f.imageUrl}
                                alt={`fact-${idx}`}
                                className="img-fluid rounded"
                                style={{ maxWidth: "200px", border: "1px solid #ddd" }}
                              />
                            )}
                            <div>
                              <strong>💡 Did you know?</strong>
                              <p className="mb-0">{f.fact}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}



                </div>

                <div className="d-flex gap-3 justify-content-center mt-4">
                  <Button onClick={handlePublish}>
                    Final Submit
                  </Button>
                  <Button variant="outline-primary" onClick={() => navigate("/my-comics")}>
                    Go to My Comics
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Style Images Modal */}
      <Modal show={showStyleImgModal} onHide={closeStyleImgModal} centered>
        <Modal.Header closeButton className="fs-16 fw-bold">Preview Image</Modal.Header>
        <Modal.Body className="p-3 text-center">
          {styles.find((s) => s.name === styleType)?.image ? (
            <img
              src={styles.find((s) => s.name === styleType)?.image}
              alt={styleType}
              className="img-fluid rounded"
            />
          ) : (
            <div className="bg-theme1 border rounded-4 p-4">
              <div className="icon mb-2"><i className="bi bi-image fs-2 lh-1"></i></div>
              <div className="fs-16 text-muted fw-medium">No preview available</div>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Theme Description Modal */}
      <Modal show={showThemeModal} onHide={() => setShowThemeModal(false)} size="lg" centered >
        <Modal.Header closeButton>
          <Modal.Title>{themeType} Theme</Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-4 text-start">
          <h5 className="mb-3">Description</h5>
          <p>{themes.find(t => t.name === themeType)?.description || "No description available"}</p>

          {themes.find(t => t.name === themeType)?.examplePages?.length > 0 && (
            <>
              <h5 className="mt-4 mb-2">Example Pages</h5>
              <div className="example-pages">
                {themes.find(t => t.name === themeType).examplePages.map((ex, idx) => (
                  <pre
                    key={idx}
                    className="p-3 mb-3 border rounded bg-light"
                    style={{
                      whiteSpace: "pre-wrap",
                      fontFamily: "monospace",
                      fontSize: "0.95rem",
                      width: "100%",     // 👈 full width use kare
                      overflowX: "auto", // agar line lambi ho to side scroll ho
                    }}
                  >
                    {ex}
                  </pre>
                ))}
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>


    </div>
  );
};

export default ComicGenerator;
