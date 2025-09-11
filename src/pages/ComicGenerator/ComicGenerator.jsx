import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ComicGenerator.scss';
import Select from "react-select";
import { Row, Col, Form, OverlayTrigger, Tooltip, Modal, Button, Spinner, Alert } from 'react-bootstrap';
import API from "../../API/index";
import { useDispatch } from "react-redux";
import { setComicStatus } from '../../redux/actions/comicActions';

// Styles Images
import MinimalistCartoon from "../../assets/images/stylesImages/minimalist-cartoon.png";
import RealisticPencil from "../../assets/images/stylesImages/realistic-pencil.png";
import WatercolorWash from "../../assets/images/stylesImages/watercolor-wash.png";
import TechnoNeon from "../../assets/images/stylesImages/techno-neon.png";
import PapercutLayers from "../../assets/images/stylesImages/papercut-layers.png";
import PixelSoft from "../../assets/images/stylesImages/pixel-soft.png";
import VectorPop from "../../assets/images/stylesImages/vector-pop.png";
import InkAndWash from "../../assets/images/stylesImages/ink-and-wash.png";
import ComicPanelClassic from "../../assets/images/stylesImages/comic-panel-classic.png";
import Realism from "../../assets/images/stylesImages/realism.png";

const Stepper = ({ currentStep }) => {
  const steps = [
    "Write a story",
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

  // ui state
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Style Images Modal
  const [showStyleImgModal, setShowStyleImgModal] = useState(false);
  const opneStyleImgModal = () => setShowStyleImgModal(true);
  const closeStyleImgModal = () => setShowStyleImgModal(false);

  // Example style → image mapping
  const styleImages = {
    "Minimalist Cartoon": MinimalistCartoon,
    "Realistic Pencil": RealisticPencil,
    "Watercolor Wash": WatercolorWash,
    "Techno Neon": TechnoNeon,
    "Papercut Layers": PapercutLayers,
    "Pixel Soft": PixelSoft,
    "Vector Pop": VectorPop,
    "Ink & Wash": InkAndWash,
    "Comic Panel Classic": ComicPanelClassic,
    "Realism": Realism
  };

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
        story,
      });

      if (!data?.pages || !Array.isArray(data.pages)) {
        throw new Error("Invalid response: pages missing");
      }

      setComicId(data.comicId || null);
      setPages(data.pages);
      setPrompt(JSON.stringify(data.pages, null, 2));
      nextStep();
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
  const handlePublish = () => {
    dispatch(setComicStatus(comicId, "published"));
    navigate("/comic-successful");
  };

  // helpers
  const isStep0Valid = story?.trim()?.length > 0 && comicTitle.trim() && author.trim() && subject.trim();


  // quiz states
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizId, setQuizId] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);


  // Generate Quiz
  const handleGenerateQuiz = async () => {
    setQuizError("");
    setQuizLoading(true);
    try {
      const { data } = await API.post("/user/generate-quiz", {
        comicId,
        script: story,
      });

      setQuizId(data.quizId);
      setQuizQuestions(data.questions);
    } catch (err) {
      console.error(err);
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
    setFaqError("");
    setFaqLoading(true);
    try {
      const { data } = await API.post("/user/generate-faqs", {
        comicId,
        story: pages, // pages ko bhejna better hai instead of story string
      });
      setFaqs(data.faqs || []);
    } catch (err) {
      console.error(err);
      setFaqError(err?.response?.data?.error || "Failed to generate FAQs");
    } finally {
      setFaqLoading(false);
    }
  };

  // Handle Generate Did You Know
  const handleGenerateFacts = async () => {
    setFactError("");
    setFactLoading(true);
    try {
      const { data } = await API.post("/user/generate-didyouknow", {
        comicId,
        subject,
        story: pages,
      });
      setFacts(data.didYouKnow || []);
    } catch (err) {
      console.error(err);
      setFactError(err?.response?.data?.error || "Failed to generate facts");
    } finally {
      setFactLoading(false);
    }
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
                        <option value="1st Standard">1st Standard</option>
                        <option value="2nd Standard">2nd Standard</option>
                        <option value="3rd Standard">3rd Standard</option>
                        <option value="4th Standard">4th Standard</option>
                        <option value="5th Standard">5th Standard</option>
                        <option value="6th Standard">6th Standard</option>
                        <option value="7th Standard">7th Standard</option>
                        <option value="8th Standard">8th Standard</option>
                        <option value="9th Standard">9th Standard</option>
                        <option value="10th Standard">10th Standard</option>
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
                        <option value="Science">Science</option>
                        <option value="Mythic">Mythic</option>
                        <option value="Fables">Classic Fables</option>
                        <option value="Motivation">Motivation</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col sm={6} md={4}>
                    <Form.Group>
                      <Form.Label>Theme</Form.Label>
                      <Form.Select
                        value={themeType}
                        onChange={(e) => setThemeType(e.target.value)}
                      >
                        <option value="" disabled>Select Theme</option>
                        <option value="Mythical Realism">Mythical Realism</option>
                        <option value="Mentor & Apprentice">Mentor & Apprentice</option>
                        <option value="Time Traveler’s Log">Classic Time Traveler’s Log</option>
                        <option value="Slice of Life">Slice of Life</option>
                        <option value="Dream World Quest">Dream World Quest</option>
                        <option value="Eco Mission">Eco Mission</option>
                        <option value="Inventor’s Diary">Inventor’s Diary</option>
                        <option value="Classroom Simulator">Classroom Simulator</option>
                        <option value="Logic Duel">Logic Duel</option>
                        <option value="Learning Tournament">Learning Tournament</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col sm={6} md={4}>
                    <Form.Group>
                      <Form.Label className="d-flex align-items-center gap-2">
                        Choose Style
                        <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-info">Click to view style image</Tooltip>}>
                          <i className="bi bi-info-circle text-primary" role="button" onClick={opneStyleImgModal}></i>
                        </OverlayTrigger>
                      </Form.Label>
                      <Form.Select
                        value={styleType}
                        onChange={(e) => setStyleType(e.target.value)}
                      >
                        <option value="" disabled>Select Style</option>
                        {Object.keys(styleImages).map((style) => (
                          <option key={style} value={style}>{style}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col sm={6} md={4}>
                    <Form.Group>
                      <Form.Label>Author</Form.Label>
                      <Form.Control
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="e.g. redu_AI"
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12}>
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
              </Form>
            )}

            {/* STEP 1: Prompt */}
            {step === 1 && (
              <Form onSubmit={handleGenerateComic}>
                <div className="fs-5 fw-semibold mb-2">Story Prompt</div>
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
                  <Button variant="secondary" onClick={() => { prevStep(); resetAfterBackToPrompt(); }}>
                    Back
                  </Button>
                  <Button type="submit" disabled={!prompt || loadingImage}>
                    {loadingImage ? (<><Spinner size="sm" className="me-2" />Generating comic...</>) : "Generate My Comic"}
                  </Button>
                </div>
              </Form>
            )}


            {/* STEP 2: Preview images */}
            {/* {step === 2 && (
              <div>
                <div className="fs-3 fw-bold mb-3">Preview My Comic</div>
                {comicImages?.length === 0 ? (
                  <Alert variant="warning">No images to show. Please go back and regenerate.</Alert>
                ) : (
                  <div className="d-flex flex-wrap gap-3 justify-content-center">
                    {comicImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`comic-${idx}`}
                        style={{
                          width: "300px",
                          height: "auto",
                          border: "2px solid #ccc",
                          borderRadius: "8px",
                        }}
                      />
                    ))}
                  </div>
                )}
                <div className="btn-wrapper mt-4 d-flex gap-3 justify-content-center">
                  <Button variant="warning" onClick={() => { setStep(1); resetAfterBackToPrompt(); }}>
                    Edit / Regenerate
                  </Button>
                  <Button variant="success" onClick={handlePublishComic} disabled={publishing}>
                    {publishing ? (<><Spinner size="sm" className="me-2" />Publishing...</>) : "Publish My Comic"}
                  </Button>
                </div>
              </div>
            )} */}

            {step === 2 && (
              <div>
                <div className="fs-3 fw-bold mb-3">Preview My Comic</div>
                {comicImages?.length === 0 ? (
                  <Alert variant="warning">No images to show. Please go back and regenerate.</Alert>
                ) : (
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
                )}

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
                  <Button variant="success" onClick={handlePublishComic} disabled={publishing}>
                    {publishing ? (
                      <>
                        <Spinner size="sm" className="me-2" /> Publishing...
                      </>
                    ) : (
                      "Publish My Comic"
                    )}
                  </Button>
                </div>
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
                    // disabled={quizLoading}
                    disabled={quizLoading || quizQuestions.length > 0}
                  >
                    {quizLoading ? "Generating Quiz..." : "Generate Quiz"}
                  </Button>



                  {quizError && <Alert variant="danger">{quizError}</Alert>}

                  {quizQuestions.length > 0 && (
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
                  )}
                </div>

                {/* FAQ Section */}
                <div className="faq-wrapper mt-5 text-start">
                  <h4>Generate FAQs for this Comic</h4>
                  <Button
                    variant="secondary"
                    className="mb-3"
                    onClick={handleGenerateFAQs}
                    disabled={faqLoading || faqs.length > 0}
                  >
                    {faqLoading ? "Generating FAQs..." : "Generate FAQs"}
                  </Button>

                  {faqError && <Alert variant="danger">{faqError}</Alert>}

                  {faqs.length > 0 && (
                    <div className="faq-list mt-4">
                      {faqs.map((f, idx) => (
                        <div key={idx} className="mb-3 p-3 border rounded">
                          <strong>Q{idx + 1}. {f.question}</strong>
                          <p className="mb-0">Ans: {f.answer}</p>
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
                    disabled={factLoading || facts.length > 0}
                  >
                    {factLoading ? "Generating Facts..." : "Generate Facts"}
                  </Button>

                  {factError && <Alert variant="danger">{factError}</Alert>}

                  {facts.length > 0 && (
                    <div className="fact-list mt-4">
                      {facts.map((f, idx) => (
                        <div key={idx} className="mb-3 p-3 border rounded bg-light">
                          <strong>Did you know?</strong>
                          <p className="mb-0">{f.fact}</p>
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
        <Modal.Header closeButton className="fs-16 fw-bold">Preview Image
        </Modal.Header>
        <Modal.Body className="p-3">
          <div className="content-wrapper text-center">
            {styleImages[styleType] ? (
              <img src={styleImages[styleType]} alt={styleType} className="img-fluid rounded" />
            ) : (
              <div className="bg-theme1 border rounded-4 p-4">
                <div className="icon mb-2"><i className="bi bi-image fs-2 lh-1"></i></div>
                <div className="fs-16 text-muted fw-medium">No preview available</div>
              </div>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ComicGenerator;
