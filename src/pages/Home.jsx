import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Form, Button, Spinner, Alert } from 'react-bootstrap';
import './Home.scss';
import API from "../API/index";
import { useDispatch } from "react-redux";
import { setComicStatus } from '../redux/actions/comicActions';


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
      <div
        className="stepper-line stepper-line-progress position-absolute bg-primary z-1"
        style={{
          width: `${(currentStep / (steps.length - 1)) * 100}%`,
          transition: "width 0.3s ease",
        }}
      />
      <div className="stepper d-flex justify-content-between position-relative z-1">
        {steps.map((label, index) => (
          <div
            key={index}
            className={`step text-center position-relative ${index === currentStep ? "active" : ""} ${index < currentStep ? "completed" : ""}`}
          >
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

export const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // flow state
  const [step, setStep] = useState(0);
  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

  // business state
  const [comicId, setComicId] = useState(null);
  const [pages, setPages] = useState([]);
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

  return (
    <div className="homePage pt-4 pb-3">
      <div className="container-xl">
        <div className="custom-wrapper mx-auto" style={{ maxWidth: "1000px" }}>
          <div className="wrapper pb-1">
            <Stepper currentStep={step} />
          </div>

          {/* Debug Step Control (optional for development) */}
          {/* <div className="d-flex gap-2 mb-3">
            <Button variant="outline-primary" onClick={() => setStep(0)}>Step 0: Story</Button>
            <Button variant="outline-primary" onClick={() => setStep(1)}>Step 1: Prompt</Button>
            <Button variant="outline-primary" onClick={() => setStep(2)}>Step 2: Preview</Button>
            <Button variant="outline-primary" onClick={() => setStep(3)}>Step 3: Publish</Button>
          </div> */}

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
                <Row className="g-3 g-md-4">
                  <Col md={4}>
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
                  <Col md={4}>
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
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Subject</Form.Label>
                      <Form.Select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                      >
                        <option value="">Select subject</option>
                        <option value="Science">Science</option>
                        <option value="Mythic">Mythic</option>
                        <option value="Fables">Classic Fables</option>
                        <option value="Motivation">Motivation</option>
                      </Form.Select>
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
            {step === 2 && (
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
                <div className="d-flex gap-3 justify-content-center mt-3">
                  <Button onClick={handlePublish} >
                    Final Submit
                  </Button>
                  <Button variant="outline-primary" onClick={() => navigate("/comics")}>
                    Go to My Comics
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
