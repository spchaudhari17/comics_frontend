import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ComicGenerator.scss';
import Select from "react-select";
import { Row, Col, Form, OverlayTrigger, Tooltip, Modal, Button, Spinner, Alert, Badge } from 'react-bootstrap';
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

  // flow state
  const [step, setStep] = useState(0);
  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
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
  const [prompt, setPrompt] = useState("");
  const [comicImages, setComicImages] = useState([]);
  const [pdfUrl, setPdfUrl] = useState("");
  const [concept, setConcept] = useState("");

  // Hardcore Quiz states
  const [hardcoreQuizData, setHardcoreQuizData] = useState({});
  const [hardcoreQuizLoading, setHardcoreQuizLoading] = useState(false);
  const [hardcoreQuizError, setHardcoreQuizError] = useState("");


  // multi-part series state
  const [series, setSeries] = useState(null);
  const [parts, setParts] = useState([]);
  const [completedParts, setCompletedParts] = useState([]);
  const [currentPart, setCurrentPart] = useState(null);

  // ui state
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [existingComic, setExistingComic] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [redirecting, setRedirecting] = useState(false);

  // Style Images Modal
  const [showStyleImgModal, setShowStyleImgModal] = useState(false);
  const openStyleImgModal = () => {
    if (styleType) {
      setShowStyleImgModal(true);
    } else {
      alert("Please select a style first!");
    }
  };
  const closeStyleImgModal = () => setShowStyleImgModal(false);

  // Theme Description Modal
  const [showThemeModal, setShowThemeModal] = useState(false);
  const openThemeModal = () => {
    if (themeType) {
      setShowThemeModal(true);
    }
  };
  const closeThemeModal = () => setShowThemeModal(false);

  // API data
  const [themes, setThemes] = useState([]);
  const [styles, setStyles] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);

  // Quiz and FAQ states
  const [quizData, setQuizData] = useState({});
  const [faqData, setFaqData] = useState({});
  const [factData, setFactData] = useState({});
  const [quizLoading, setQuizLoading] = useState(false);
  const [faqLoading, setFaqLoading] = useState(false);
  const [factLoading, setFactLoading] = useState(false);
  const [quizError, setQuizError] = useState("");
  const [faqError, setFaqError] = useState("");
  const [factError, setFactError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  // Initialize data
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
        setSubjectsList(subjectsRes.data || []);
      } catch (err) {
        console.error("Error fetching themes, styles, or subjects:", err);
      }
    };

    fetchData();

    // Country data
    fetch("https://valid.layercode.workers.dev/list/countries?format=select&flags=true&value=code")
      .then((response) => response.json())
      .then((data) => {
        setCountries(data.countries);
        setSelectedCountry(data.userSelectValue);
      });
  }, []);

  // ✅ IMPROVED RESUME LOGIC - Skip breakdown for resume comics
  useEffect(() => {
    const loadResumeComic = async () => {
      if (resumeComicId) {
        try {
          setLoadingPrompt(true);
          const { data } = await API.get(`/user/comics/${resumeComicId}`);
          const comic = data.comic;

          // Set current part data
          setCurrentPart({
            comicId: resumeComicId,
            part: comic?.partNumber || 1,
            title: comic?.title || "Untitled"
          });

          setComicId(resumeComicId);
          setComicTitle(comic?.title || "");
          setSubject(comic?.subject || "");
          setConcept(comic?.concept || "");
          setStory(comic?.story || "");

          // Check comic status and go to appropriate step
          if (comic?.comicStatus === 'published') {
            // Already published - go to step 4 (PDF view)
            if (comic?.prompt) {
              setPrompt(JSON.stringify(JSON.parse(comic.prompt), null, 2));
            }
            setStep(4);
          } else if (comic?.images && comic.images.length > 0) {
            // Images already generated - go to step 3 (preview)
            setComicImages(comic.images.map(img => img.imageUrl));
            setSelectedImage(comic.images[0]?.imageUrl);
            setStep(3);
          } else if (comic?.prompt) {
            // Prompt generated but no images - go to step 2 (prompt editor)
            setPrompt(JSON.stringify(JSON.parse(comic.prompt), null, 2));
            setStep(2);
          } else {
            // No prompt yet - stay at step 0
            setStep(0);
          }

        } catch (err) {
          console.error("Failed to resume comic:", err);
          setErrorMsg("Failed to load comic data");
          setStep(0); // Fallback to step 0
        } finally {
          setLoadingPrompt(false);
        }
      }
    };

    loadResumeComic();
  }, [resumeComicId]);

  // LocalStorage management
  useEffect(() => {
    if (!resumeComicId) {
      const userInfo = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user"))
        : null;

      const userId = userInfo?._id;   // ✅ direct from userInfo

      if (userId) {
        const saved = localStorage.getItem(`currentSeries_${userId}`);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setSeries(parsed.series);
            setParts(parsed.parts);
            setCompletedParts(parsed.completedParts || []);
            setCurrentPart(parsed.currentPart);
          } catch (err) {
            console.error("Error parsing saved series data:", err);
          }
        }
      }
    }
  }, [resumeComicId]);


  // Save to localStorage
  useEffect(() => {
    if (parts.length > 0) {
      const userInfo = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user"))
        : null;

      const userId = userInfo?._id;   // ✅ direct from userInfo

      if (userId) {
        localStorage.setItem(
          `currentSeries_${userId}`,
          JSON.stringify({
            series,
            parts,
            completedParts,
            currentPart
          })
        );
      }
    }
  }, [series, parts, completedParts, currentPart]);


  // STEP 1: Story → Prompt
  const handleConvertToPrompt = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoadingPrompt(true);

    try {
      const { data } = await API.post("/user/refine-prompt", {
        title: comicTitle,
        author,
        subject: subjectsList.find(s => s._id === subject)?.name || subject,
        subjectId: subject,
        concept,
        story,
        themeId: themes.find(t => t.name === themeType)?._id,
        styleId: styles.find(s => s.name === styleType)?._id,
        grade: classGrade,
        country: selectedCountry?.value
      });

      if (data.alreadyExists) {
        setExistingComic(data.series);
        return;
      }

      if (!data?.parts || !Array.isArray(data.parts)) {
        throw new Error("Invalid response: no parts found");
      }

      setSeries(data.series);
      setParts(data.parts);
      setCompletedParts([]);
      setCurrentPart(null);
      setStep(1); // Go to breakdown step (aapka purana flow)
    } catch (err) {
      console.error("Prompt refinement failed.", err);
      setErrorMsg(err?.response?.data?.error || "Prompt refinement failed.");
    } finally {
      setLoadingPrompt(false);
    }
  };

  // Load part data - AAPKE PURANE CODE JAISA
  const loadPartData = async (part) => {
    try {
      const { data } = await API.get(`/user/comics/${part.comicId}`);

      // ✅ reset states for new part
      setComicId(part.comicId);
      setComicImages([]);
      setSelectedImage(null);
      setPdfUrl("");
      setPages([]);

      if (data.comic?.prompt) {
        setPrompt(JSON.stringify(JSON.parse(data.comic.prompt), null, 2));
      } else {
        setPrompt("");
      }

      // Set current part
      setCurrentPart({
        comicId: part.comicId,
        part: part.part,
        title: part.title
      });

      setStep(2); // move to Prompt editor
    } catch (err) {
      console.error("Failed to fetch comic:", err);
      setErrorMsg("Could not load comic script. Please try again.");
    }
  };

  // STEP 2: Prompt → Images
  const handleGenerateComic = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoadingImage(true);

    try {
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
      setSelectedImage(imgs[0]);
      setStep(2); // Go to preview step
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.response?.data?.error || err.message || "Error generating comic images.");
    } finally {
      setLoadingImage(false);
    }
  };

  // STEP 3: Generate PDF
  const handleGeneratePDF = async () => {
    setErrorMsg("");
    setPublishing(true);
    try {
      const { data } = await API.post("/user/generateComicPDF", { comicId });
      if (!data?.pdfUrl) throw new Error("PDF URL not returned");
      setPdfUrl(data.pdfUrl);
      setStep(4); // Go to publish step
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.response?.data?.error || "Failed to generate PDF.");
    } finally {
      setPublishing(false);
    }
  };

  // ✅ UPDATED: STEP 4: Final Publish with AUTO-REDIRECT to MyComics
  const handlePublish = () => {
    dispatch(setComicStatus(comicId, "published"));

    // mark current part as completed
    setCompletedParts((prev) => [...new Set([...prev, comicId])]);

    // ✅ redirect back to Concept Breakdown (Step 1)
    setStep(1);
  };

  // Helper functions
  const isStep0Valid = story?.trim()?.length > 0 && comicTitle.trim() && subject.trim();

  const handleGenerateQuiz = async () => {
    setQuizLoading(true);
    setQuizError("");
    try {
      const subjectName = subjectsList.find(s => s._id === subject)?.name || subject;

      const { data } = await API.post("/user/generate-quiz", {
        comicId,
        script: prompt,
        subject: subjectName,
        concept,
        grade: classGrade

      });
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

  const handleGenerateFAQs = async () => {
    setFaqLoading(true);
    setFaqError("");
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

  const handleGenerateFacts = async () => {
    setFactLoading(true);
    setFactError("");
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

  const handleGenerateHardcoreQuiz = async () => {
    setHardcoreQuizLoading(true);
    setHardcoreQuizError("");
    try {
      const subjectName = subjectsList.find(s => s._id === subject)?.name || subject;

      const { data } = await API.post("/user/generate-hardcore-quiz", {
        comicId,
        script: prompt,
        subject: subjectName,
        concept,
        grade: classGrade,
      });

      setHardcoreQuizData(prev => ({
        ...prev,
        [comicId]: data.questions || [],
      }));
    } catch (err) {
      setHardcoreQuizError(err?.response?.data?.error || "Failed to generate hardcore quiz");
    } finally {
      setHardcoreQuizLoading(false);
    }
  };


  const resetAfterBackToPrompt = () => {
    setComicImages([]);
    setPdfUrl("");
    setSelectedImage(null);
  };

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
            <Button variant="outline-primary" onClick={() => setStep(1)}>Step 1: Breakdown</Button>
            <Button variant="outline-primary" onClick={() => setStep(2)}>Step 2: Prompt</Button>
            <Button variant="outline-primary" onClick={() => setStep(3)}>Step 3: Preview</Button>
            <Button variant="outline-primary" onClick={() => setStep(4)}>Step 4: Publish</Button>
          </div>

          {successMsg && (
            <Alert variant="success" className="mb-4">
              {successMsg}
              {redirecting && <Spinner size="sm" className="ms-2" />}
            </Alert>
          )}

          {errorMsg && (
            <Alert variant="danger" className="mb-4">
              {errorMsg}
            </Alert>
          )}

          <div className="content-wrapper bg-theme1 border rounded-3 px-3 py-4 p-md-5">
            {/* STEP 0: Story */}
            {step === 0 && (
              <Form onSubmit={handleConvertToPrompt}>
                <div className="heading-wrapper text-dark mb-4">
                  <div className="fs-3 fw-bold">Write your story</div>
                  {resumeComicId && (
                    <div className="text-muted fs-6">Resuming comic creation...</div>
                  )}
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
                        <option value="1st Standard">1st Grade</option>
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
                    <Form.Group>
                      <Form.Label>Subject</Form.Label>
                      <Form.Select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                      >
                        <option value="" disabled>Select subject</option>
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
                        <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-info">Select a style and then click to view style</Tooltip>}>
                          <i className="bi bi-info-circle text-primary" role="button" onClick={openStyleImgModal}></i>
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
                    </div>
                  </div>
                )}
              </Form>
            )}

            {/* STEP 1: Concept Breakdown - AAPKE PURANE CODE JAISA */}
            {step === 1 && (
              <div>
                <div className="fs-3 fw-bold mb-3">Concept Breakdown</div>
                <p className="text-muted">Your concept has been divided into the following parts:</p>

                {parts.length === 0 ? (
                  <Alert variant="warning">No parts returned from backend.</Alert>
                ) : (
                  <div className="d-flex flex-column gap-3">
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
                              onClick={() => loadPartData(p)}
                            >
                              Generate Comic for Part {p.part}
                            </Button>
                          )}

                          {isDone && (
                            <Button variant="outline-secondary" disabled>
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

            {/* STEP 2: Prompt Editor */}
            {step === 2 && (
              <div>
                <div className="fs-3 fw-bold mb-3">
                  {currentPart ? `Part ${currentPart.part}: ${currentPart.title}` : 'Preview My Comic'}
                </div>

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
                  <>
                    <Row>
                      <Col md={3} className="border-end pe-3" style={{ maxHeight: "500px", overflowY: "auto" }}>
                        <div className="d-flex flex-column gap-2">
                          {comicImages.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`comic-${idx}`}
                              onClick={() => setSelectedImage(img)}
                              className={`img-thumbnail ${selectedImage === img ? "border-primary border-3" : ""}`}
                              style={{
                                cursor: "pointer",
                                objectFit: "cover",
                                height: "80px",
                              }}
                            />
                          ))}
                        </div>
                      </Col>

                      <Col md={9} className="d-flex justify-content-center align-items-center">
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
                          <p className="text-muted">Click on a thumbnail to preview the image.</p>
                        )}
                      </Col>
                    </Row>

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
                        onClick={handleGeneratePDF}
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

            {/* STEP 3: PDF Generation */}
            {step === 3 && (
              <div className="text-center">
                <h3>Comic PDF Generated 🎉</h3>
                {pdfUrl ? (
                  <div className="mt-4">
                    <p>Your comic PDF has been successfully generated!</p>

                    {/* <Button
                      variant="primary"
                      onClick={() => window.open(pdfUrl, "_blank")}
                      className="me-3"
                    >
                      View PDF
                    </Button> */}

                    <Button
                      variant="success"
                      onClick={() => setStep(4)}
                    >
                      Publish Comic
                    </Button>
                  </div>
                ) : (
                  <Alert variant="warning" className="mt-3">
                    PDF URL not found. Try generating again.
                  </Alert>
                )}
              </div>
            )}

            {/* STEP 4: Publish */}
            {step === 4 && (
              <div className="text-center">
                <h3>Comic Published 🎉</h3>
                {pdfUrl ? (
                  <p className="mt-3">
                    {/* <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                      Open PDF from S3
                    </a> */}
                  </p>
                ) : (
                  <Alert variant="warning">PDF URL not found. Try publishing again.</Alert>
                )}

                {/* Additional Content Sections */}
                <div className="mt-5 text-start">
                  {/* Quiz Section */}
                  <div className="quiz-wrapper mt-4">
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

                  {/* Hardcore Quiz Section */}
                  <div className="hardcore-quiz-wrapper mt-5">
                    <h4>🔥 Generate Hardcore Quiz (Challenge Mode)</h4>
                    <Button
                      variant="danger"
                      className="mb-3"
                      onClick={handleGenerateHardcoreQuiz}
                      disabled={hardcoreQuizLoading || hardcoreQuizData[comicId]?.length > 0}
                    >
                      {hardcoreQuizLoading ? "Generating Hardcore Quiz..." : "Generate Hardcore Quiz"}
                    </Button>

                    {hardcoreQuizError && <Alert variant="danger">{hardcoreQuizError}</Alert>}

                    {hardcoreQuizData[comicId]?.length > 0 && (
                      <div className="hardcore-quiz-questions mt-4">
                        {hardcoreQuizData[comicId].map((q, idx) => (
                          <div key={idx} className="mb-4 p-3 border rounded bg-light">
                            <strong>Q{idx + 1}. {q.question}</strong>
                            <ul className="mt-2">
                              {q.options.map((opt, i) => (
                                <li key={i}>{opt}</li>
                              ))}
                            </ul>
                            <p className="text-success mb-1">✔ Correct: {q.correctAnswer}</p>
                            <p className="text-warning mb-1">💪 Difficulty: {q.difficulty}</p>
                            <p className="text-muted">🧠 Explanation: {q.explanation}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>


                  {/* FAQ Section */}
                  <div className="faq-wrapper mt-5">
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

                  {/* Facts Section */}
                  <div className="fact-wrapper mt-5">
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

      {/* Modals */}
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

      <Modal show={showThemeModal} onHide={closeThemeModal} size="lg" centered>
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
                      width: "100%",
                      overflowX: "auto",
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