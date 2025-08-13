import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Form, Button } from 'react-bootstrap';
import './Home.scss';
// import ComicImg1 from "../assets/images/comic-img1.jpg";
import API from "../API/index";

// Stepper Component
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
            {/* Progress line */}
            <div className="stepper-line stepper-line-progress position-absolute bg-primary z-1"
                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%`, transition: 'width 0.3s ease', }}
            />
            <div className="stepper d-flex justify-content-between position-relative z-1">
                {steps.map((label, index) => (
                    <div key={index} className={`step text-center position-relative ${index === currentStep ? "active" : ""} ${index < currentStep ? "completed" : ""}`}>
                        <div className="step-number d-flex align-items-center justify-content-center">{index + 1}</div>
                        <div className="step-label position-absolute top-100 start-50 translate-middle-x text-nowrap mt-1">{label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const Home = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [comicTitle, setComicTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [story, setStory] = useState("");
    const [prompt, setPrompt] = useState("");
    const [comicImage, setComicImage] = useState(null);
    const [subject, setSubject] = useState("");

    const [loadingPrompt, setLoadingPrompt] = useState(false);
    const [loadingImage, setLoadingImage] = useState(false);

    const nextStep = () => setStep((prev) => prev + 1);
    const prevStep = () => setStep((prev) => prev - 1);

    // const handleConvertToPrompt = (e) => {
    //     e.preventDefault();
    //     setPrompt(`Prompt generated from: ${story}`);
    //     nextStep();
    // };


    const handleConvertToPrompt = async (e) => {
        e.preventDefault();
        setLoadingPrompt(true);

        try {
            const response = await API.post("/user/refine-prompt", {
                title: comicTitle,
                author: author,
                subject: subject,
                story: story
            });

            if (response.status !== 200) {
                throw new Error(`Server error: ${response.status}`);
            }

            if (response.data.refinedPrompt) {
                setPrompt(response.data.refinedPrompt);
            } else {
                setPrompt("Could not refine prompt, please try again.");
            }

            nextStep();
        } catch (error) {
            console.error("Error refining prompt:", error);
            alert("Failed to refine prompt. Please check your backend or API key.");
        }
        finally {
            setLoadingPrompt(false);
        }
    };




    // const handleGenerateComic = (e) => {
    //     e.preventDefault();
    //     setComicImage(ComicImg1);
    //     nextStep();
    // };

    const handleGenerateComic = async (e) => {
        e.preventDefault();
        setLoadingImage(true);

        try {
            const response = await API.post("/user/generate-comic", { prompt });

            if (response.data.image) {
                setComicImage(response.data.image); // Base64 or image URL
                nextStep();
            } else {
                alert("Failed to generate comic image.");
            }
        } catch (error) {
            console.error("Error generating comic:", error);
            alert("Error generating comic image.");
        }
        finally {
            setLoadingImage(false);
        }
    };


    const handlePublishComic = () => {
        nextStep();
    };


    return (
        <div className="homePage pt-4 pb-3">
            <div className="container-xl">
                <div className="custom-wrapper mx-auto" style={{ maxWidth: '1000px' }}>
                    <div className="wrapper pb-1">
                        <Stepper currentStep={step} />
                    </div>

                    <div className="content-wrapper bg-theme1 border rounded-3 px-3 py-4 p-md-5">
                        {step === 0 && (
                            <Form onSubmit={handleConvertToPrompt}>
                                <div className="step-content-wrapper">
                                    <div className="heading-wrapper text-dark mb-4">
                                        <div className="fs-3 fw-bold font-roboto lh-sm mb-2">Write your story</div>
                                        <div className="subtitle fs-14 text-muted">
                                            Craft your comic’s title, author name, and storyline in your own words.
                                            This will be the foundation for creating your unique comic.
                                        </div>
                                    </div>
                                    <Row className="g-3 g-md-4">
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label>Comic Title</Form.Label>
                                                <Form.Control type="text" value={comicTitle} onChange={(e) => setComicTitle(e.target.value)} placeholder='Enter comic title' />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label>Author</Form.Label>
                                                <Form.Control type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder='Enter author name' />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label>Subject</Form.Label>
                                                <Form.Select value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Select subject">
                                                    <option value="" disabled>Select subject</option>
                                                    <option value="Science">Science</option>
                                                    <option value="Mythic & Legendary">Mythic & Legendary</option>
                                                    <option value="Classic Fables & Moral">Classic Fables & Moral</option>
                                                    <option value="Inspirational & Motivational">Inspirational & Motivational</option>
                                                    <option value="Modern & Everyday Life">Modern & Everyday Life</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col xs={12}>
                                            <Form.Group>
                                                <Form.Label>Write Story</Form.Label>
                                                <Form.Control as="textarea" rows={8} value={story} onChange={(e) => setStory(e.target.value)} placeholder='Write your comic story here...' />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <div className="btn-wrapper d-flex flex-column flex-sm-row align-items-sm-center gap-3 mt-4 pt-2">
                                        {/* <Button type="submit" variant='primary' className="btn-custom" disabled={!story}>Convert Story into Prompt</Button> */}
                                        <Button type="submit" variant='primary' className="btn-custom" disabled={!story || loadingPrompt}>
                                            {loadingPrompt ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                                                    Generating prompt...
                                                </>
                                            ) : (
                                                "Convert Story into Prompt"
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </Form>
                        )}

                        {step === 1 && (
                            <Form onSubmit={handleGenerateComic}>
                                <div className="step-content-wrapper">
                                    <div className="heading-wrapper text-dark mb-4">
                                        <div className="fs-3 fw-bold font-roboto lh-sm mb-2">Suggested Story Prompt</div>
                                        <div className="subtitle fs-14 text-muted">
                                            Your story has been transformed into a creative prompt.
                                            You can review it, make adjustments, and get it ready for comic generation.
                                        </div>
                                    </div>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Story Prompt</Form.Label>
                                        <Form.Control as="textarea" rows={10} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder='Write your story prompt here...' />
                                    </Form.Group>
                                    <div className="btn-wrapper d-flex flex-column flex-sm-row align-items-sm-center gap-3 mt-4 pt-2">
                                        <Button variant="secondary" className="btn-custom" onClick={prevStep}><i className="bi bi-arrow-left me-1"></i> Back</Button>
                                        {/* <Button type="submit" variant='primary' className="btn-custom" disabled={!prompt}>Generate My Comic</Button> */}

                                        <Button type="submit" variant='primary' className="btn-custom" disabled={!prompt || loadingImage}>
                                            {loadingImage ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                                                    Generating comic...
                                                </>
                                            ) : (
                                                "Generate My Comic"
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </Form>
                        )}

                        {step === 2 && (
                            <div className="step-content-wrapper">
                                <div className="heading-wrapper text-dark mb-4">
                                    <div className="fs-3 fw-bold font-roboto lh-sm mb-2">Preview My Comic</div>
                                    <div className="subtitle fs-14 text-muted">
                                        Here’s your generated comic based on the story prompt.
                                        Review the visuals and make edits before publishing.
                                    </div>
                                </div>

                                {comicImage &&
                                    <div className="img-wrapper ratio ratio-4x3 border rounded-2">
                                        <img src={comicImage} alt="Generated Comic" className="img-fluid object-fit-contain" />
                                    </div>
                                }

                                <div className="btn-wrapper d-flex flex-column flex-sm-row align-items-sm-center gap-3 mt-4 pt-2">
                                    <Button variant="warning" className="btn-custom d-flex align-items-center justify-content-center gap-2" onClick={() => setStep(1)}>Edit / Regenerate</Button>
                                    <Button variant="success" className="btn-custom" onClick={handlePublishComic}>Publish My Comic</Button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="step-content-wrapper">
                                <div className="heading-wrapper text-dark mb-4">
                                    <div className="fs-3 fw-bold font-roboto lh-sm mb-2">Ready to Share Your Creation?</div>
                                    <div className="subtitle fs-14 text-muted">
                                        <div className="mb-2">Your comic is ready for the world to see. Once you hit publish, it will be visible to everyone on our platform. Please review the details below before publishing.</div>
                                        <div>Please review the details below before publishing.</div>
                                    </div>
                                </div>

                                {comicImage &&
                                    <div className="img-wrapper mb-4">
                                        <img src={comicImage} alt="Generated Comic" className="img-thumbnail object-fit-contain" style={{ maxWidth: '300px' }} />
                                    </div>
                                }

                                <div className="info-wrapper">
                                    <Row className="g-3">
                                        <Col sm={6}>
                                            <div className="box-info">
                                                <div className="title text-primary mb-1">Comic Title:</div>
                                                <div className="value">{comicTitle}</div>
                                            </div>
                                        </Col>
                                        <Col sm={6}>
                                            <div className="box-info">
                                                <div className="title text-primary mb-1">Comic Author:</div>
                                                <div className="value">{author}</div>
                                            </div>
                                        </Col>
                                        <Col xs={12}>
                                            <div className="box-info">
                                                <div className="title text-primary mb-1">Comic Story:</div>
                                                <div className="value">{story.slice(0, 100)}...</div>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>

                                <div className="btn-wrapper d-flex flex-column flex-sm-row align-items-sm-center gap-3 mt-4 pt-2">
                                    <Button variant="secondary" className="btn-custom d-flex align-items-center justify-content-center gap-2" onClick={() => setStep(2)}><i className="bi bi-arrow-left me-1"></i> Back</Button>
                                    <Button type="submit" variant="success" className="btn-custom d-flex align-items-center justify-content-center gap-2" onClick={() => navigate("/comic-successful")}><i className="bi bi-send-fill"></i> Final Submit</Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

