import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ComicGenerator.scss';
import Select from "react-select";
import { Row, Col, Form, OverlayTrigger, Tooltip, Modal, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import API from "../../API/index";
import { useDispatch } from "react-redux";
import { setComicStatus } from '../../redux/actions/comicActions';
import { useLocation } from "react-router-dom";
import forComics from "../../assets/images/forComics.jpeg";
import forImage from "../../assets/images/forImage.jpeg";
import { trackClick, trackClickWithUser, trackEvent, useScrollDepth } from "../../utility/analytics";
import EditComicPageModal from './EditComicPageModal';
import ScriptEditor from './ScriptEditor';
import ZoomImage from '../../components/ZoomImage';
import GenerationLoader from '../../components/GenerationLoader';
import PartsBreakdown from './PartsBreakdown';
import './StoryStep.scss';

// Theme / Style dropdown me "Custom" option ki value (backend limit ke barabar)
const CUSTOM_OPTION = "__custom__";
const CUSTOM_TEXT_MAX = 100;
// "Write Story" box me max itne characters
const STORY_MAX = 5000;

// Loading ke chhote messages (har ~3.5 sec badalte hain)
const PROMPT_LOADING_MESSAGES = [
  "Reading your story",
  "Finding the key ideas",
  "Splitting it into parts",
  "Creating your characters",
  "Planning each part",
  "Almost ready",
];

const IMAGE_LOADING_MESSAGES = [
  "Getting the art style ready",
  "Sketching the first page",
  "Drawing the characters",
  "Adding colours and details",
  "Checking every detail",
  "Drawing the remaining pages",
];

// Mandatory field ke label ke saath lal star
const RequiredMark = () => (
  <span className="text-danger ms-1" aria-hidden="true">*</span>
);

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

  const [subscription, setSubscription] = useState(null);
  const [subLoading, setSubLoading] = useState(true);

  const subscriptionType = subscription?.planType || "FREE";

  const isDashboardOnly = subscriptionType === "DASHBOARD";
  const isFreeUser = subscriptionType === "FREE";
  const isBundle = subscriptionType === "bundle";
  const isUnlimited = subscriptionType === "UNLIMITED";



  // business state
  const [comicId, setComicId] = useState(null);
  const [pages, setPages] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState({});
  const [classGrade, setClassGrade] = useState("");
  const [themeType, setThemeType] = useState("");
  const [styleType, setStyleType] = useState("");
  // Custom theme / style: sirf is comic ke liye, list me save nahi hota
  const [customTheme, setCustomTheme] = useState("");
  const [customStyle, setCustomStyle] = useState("");
  const isCustomTheme = themeType === CUSTOM_OPTION;
  const isCustomStyle = styleType === CUSTOM_OPTION;
  const [comicTitle, setComicTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [subject, setSubject] = useState("");
  const [story, setStory] = useState("");
  const [prompt, setPrompt] = useState("");
  const [comicImages, setComicImages] = useState([]);
  const [pdfUrl, setPdfUrl] = useState("");
  const [concept, setConcept] = useState("");
  const [showTextInImage, setShowTextInImage] = useState(true);

  // Content generation states
  const [quizData, setQuizData] = useState({});
  const [faqData, setFaqData] = useState({});
  const [factData, setFactData] = useState({});
  const [hardcoreQuizData, setHardcoreQuizData] = useState({});

  // Loading states for all content
  const [quizLoading, setQuizLoading] = useState(false);
  const [faqLoading, setFaqLoading] = useState(false);
  const [factLoading, setFactLoading] = useState(false);
  const [hardcoreQuizLoading, setHardcoreQuizLoading] = useState(false);

  // Error states
  const [quizError, setQuizError] = useState("");
  const [faqError, setFaqError] = useState("");
  const [factError, setFactError] = useState("");
  const [hardcoreQuizError, setHardcoreQuizError] = useState("");

  // multi-part series state
  const [series, setSeries] = useState(null);
  const [parts, setParts] = useState([]);
  const [completedParts, setCompletedParts] = useState([]);
  const [currentPart, setCurrentPart] = useState(null);
  const [showComicTypeModal, setShowComicTypeModal] = useState(false);

  // ui state
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [existingComic, setExistingComic] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [redirecting, setRedirecting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  // Sirf page images ki request chal rahi hai (quiz / FAQ wala time isme nahi)
  const [pagesGenerating, setPagesGenerating] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState("");
  const [currentGeneratingPage, setCurrentGeneratingPage] = useState(0);

  const [publicComics, setPublicComics] = useState([]);
  const [pubPage, setPubPage] = useState(1);
  const [pubTotalPages, setPubTotalPages] = useState(1);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const { data } = await API.get("/subscription/me");
        setSubscription(data);
      } catch (err) {
        setSubscription(null);
      } finally {
        setSubLoading(false);
      }
    };

    fetchSubscription();
  }, []);



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
  const [selectedImage, setSelectedImage] = useState(null);

  // ✏️ Single page edit
  const [editingPage, setEditingPage] = useState(null);   // { page, imageUrl, panels }
  const [editedPages, setEditedPages] = useState([]);     // kaunse pages badle (badge ke liye)

  // ---------------- Google Analytics ----------------
  // JSON script edit tracking (fires "json_script_edited" once per comic part)
  const scriptEditedRef = useRef(false);
  const originalPromptRef = useRef("");
  const thumbnailsRef = useRef(null);
  // Step 4 par is comic ka content load / generate ho chuka hai (dobara na chale)
  const contentCheckedRef = useRef(null);

  useEffect(() => {
    scriptEditedRef.current = false;
    originalPromptRef.current = "";
  }, [comicId]);

  const isComicScreen = step === 2 && comicImages?.length > 0;
  const isQuizScreen = step === 4;

  // Comic screen (preview) - page scroll + thumbnails list scroll
  useScrollDepth("create_comic_comic_screen", {
    enabled: isComicScreen,
    resetKey: comicId,
    params: { comic_id: comicId || "" },
  });
  useScrollDepth("create_comic_comic_thumbnails", {
    containerRef: thumbnailsRef,
    enabled: isComicScreen,
    resetKey: comicId,
    params: { comic_id: comicId || "" },
  });

  // Quiz screen (step 4) - page scroll
  useScrollDepth("create_comic_quiz_screen", {
    enabled: isQuizScreen,
    resetKey: comicId,
    params: { comic_id: comicId || "" },
  });

  const handleScriptChange = (value) => {
    if (!scriptEditedRef.current) {
      scriptEditedRef.current = true;
      originalPromptRef.current = prompt;
      trackEvent("json_script_edited", {
        comic_id: comicId || "",
        part_number: currentPart?.part || "",
        page_path: window.location.pathname,
      });
    }
    setPrompt(value);
  };

  // Initialize data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [themesRes, stylesRes, subjectsRes] = await Promise.all([
          API.get("/user/getAllThemes"),
          API.get("/user/getAllStyles"),
          API.get("/user/getAllSubjectsForWeb"),
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
          } else if (comic?.scriptStatus === "pending" || comic?.scriptStatus === "failed") {
            // Is part ki script abhi background me ban rahi hai / fail hui (retry chala do)
            if (comic.scriptStatus === "failed") {
              API.post("/user/retry-part-script", { comicId: resumeComicId }).catch(() => { });
            }
            setErrorMsg("The script for this part is still being prepared. Please open it again from My Comics in a minute.");
            setStep(0);
          } else if (data.pages && data.pages.length > 0) {
            // Images ban chuki hain -> preview (yahan se page edit + PDF ho sakta hai)
            // (pehle `comic.images` check hota tha jo API bhejti hi nahi thi)
            const resumedImages = data.pages.map((p) => ({
              page: p.pageNumber,
              imageUrl: p.imageUrl,
              panels: p.panels || [],
              caption: (p.panels || []).map((panel) => panel.caption).filter(Boolean).join("\n"),
            }));

            if (comic?.prompt) {
              const script = JSON.parse(comic.prompt);
              setPrompt(JSON.stringify(script, null, 2));
              if (Array.isArray(script)) setPages(script);
            }

            setComicImages(resumedImages);
            setSelectedImage(resumedImages[0]);
            setStep(2);
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

  const loadPublicComics = async (page = 1) => {
    try {
      if (!selectedCountry?.value) return;  // Country not selected → show nothing

      const params = {
        page,
        limit: 5,
        country: selectedCountry.value
      };

      if (classGrade) params.grade = classGrade;
      if (subject) params.subjectId = subject;
      if (concept) params.concept = concept;

      const { data } = await API.get("/user/listComicsforPublic", { params });

      setPublicComics(data.comics);
      setPubPage(data.page);
      setPubTotalPages(data.totalPages);
    } catch (err) {
      console.error("Error loading comics:", err);
    }
  };


  useEffect(() => {
    if (step !== 0) return;   // only run on step 0
    loadPublicComics(1);
  }, [selectedCountry, classGrade, subject, concept]);




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
    trackClickWithUser("convert_to_prompt_click", {
      subject: subjectsList.find(s => s._id === subject)?.name || subject,
      grade: classGrade,
      country: selectedCountry?.value || "",
      theme: isCustomTheme ? "custom" : themeType,
      style: isCustomStyle ? "custom" : styleType,
      show_text_in_image: showTextInImage,
    });
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
        themeId: isCustomTheme ? undefined : themes.find(t => t.name === themeType)?._id,
        styleId: isCustomStyle ? undefined : styles.find(s => s.name === styleType)?._id,
        customTheme: isCustomTheme ? customTheme.trim() : undefined,
        customStyle: isCustomStyle ? customStyle.trim() : undefined,
        grade: classGrade,
        country: selectedCountry?.value,
        showTextInImage,
        // Parts turant aa jaate hain, har part ki script background me banti hai
        progressive: true,
      });

      if (data.alreadyExists) {
        setExistingComic(data.series);
        return;
      }

      if (!data?.parts || !Array.isArray(data.parts)) {
        throw new Error("Invalid response: no parts found");
      }

      setSeries(data.series);
      // seriesId har part ke saath, taaki script status poll ho sake (localStorage me bhi rahe)
      setParts(data.parts.map((p) => ({ ...p, seriesId: data.seriesId })));
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

  // ---------------- Progressive scripts ----------------
  // Parts turant dikhte hain; jis part ki script ready ho woh shuru kar sakte hain,
  // baaki background me bante rehte hain. Pending rahe tab tak status poll karo.
  const pollSeriesId = parts.find((p) => p.seriesId)?.seriesId;
  const hasPendingScripts = parts.some((p) => p.scriptStatus === "pending");
  // Scripts series wise banti hain: pehla pending part abhi likha ja raha hai, baaki queue me
  const writingPartNumber = parts
    .filter((p) => p.scriptStatus === "pending")
    .reduce((min, p) => (min == null || p.part < min ? p.part : min), null);

  const applyScriptStatuses = (statusParts = []) => {
    const statusMap = new Map(statusParts.map((s) => [String(s.comicId), s.scriptStatus]));
    setParts((prev) =>
      prev.map((p) =>
        statusMap.has(String(p.comicId)) ? { ...p, scriptStatus: statusMap.get(String(p.comicId)) } : p
      )
    );
  };

  useEffect(() => {
    if (!pollSeriesId || !hasPendingScripts) return;

    let cancelled = false;
    const checkStatus = async () => {
      try {
        const { data } = await API.get(`/user/series/${pollSeriesId}/script-status`);
        if (!cancelled) applyScriptStatuses(data?.parts);
      } catch {
        // network glitch -> agle tick pe phir try
      }
    };

    checkStatus();
    const timer = setInterval(checkStatus, 4000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollSeriesId, hasPendingScripts]);

  const retryPartScript = async (part) => {
    try {
      setParts((prev) =>
        prev.map((p) => (p.comicId === part.comicId ? { ...p, scriptStatus: "pending" } : p))
      );
      const { data } = await API.post("/user/retry-part-script", { comicId: part.comicId });
      if (data?.scriptStatus) applyScriptStatuses([{ comicId: part.comicId, scriptStatus: data.scriptStatus }]);
    } catch (err) {
      applyScriptStatuses([{ comicId: part.comicId, scriptStatus: "failed" }]);
      setErrorMsg(err?.response?.data?.error || "Could not retry this part. Please try again.");
    }
  };

  // Load part data - AAPKE PURANE CODE JAISA
  const loadPartData = async (part) => {
    if (part.scriptStatus === "pending" || part.scriptStatus === "failed") return;

    trackClick("generate_comic_part_click", {
      comic_id: part.comicId,
      part_number: part.part,
      total_parts: parts.length,
    });
    try {
      const { data } = await API.get(`/user/comics/${part.comicId}`);

      // Background script abhi bhi ban rahi ho (status purana tha) -> wapas parts list pe
      if (data.comic?.scriptStatus === "pending" || data.comic?.scriptStatus === "failed") {
        applyScriptStatuses([{ comicId: part.comicId, scriptStatus: data.comic.scriptStatus }]);
        return;
      }

      // ✅ reset states for new part
      setComicId(part.comicId);
      setComicImages([]);
      setSelectedImage(null);
      setEditedPages([]);
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

  // ✅ IMPROVED: Function to generate all additional content with better error handling
  // only: kaunsa content banana hai (default sab). Retry / resume me sirf missing wala.
  const generateAllContent = async (only = { quiz: true, faq: true, fact: true, hardcore: true }) => {
    contentCheckedRef.current = comicId;
    const subjectName = subjectsList.find(s => s._id === subject)?.name || subject;

    console.log('🔄 Starting content generation for comic:', comicId);
    console.log('📝 Subject:', subjectName);
    console.log('🎯 Concept:', concept);
    console.log('📚 Grade:', classGrade);

    // Start all content generation in parallel
    const promises = [
      // Quiz
      only.quiz && (async () => {
        setQuizLoading(true);
        setQuizError("");
        try {
          console.log('📝 Starting Quiz generation...');
          const { data } = await API.post("/user/generate-quiz", {
            comicId,
            script: prompt,
            subject: subjectName,
            concept,
            grade: classGrade
          });
          console.log('✅ Quiz generated:', data.questions?.length, 'questions');
          if (!data.questions?.length) throw new Error("No quiz questions were generated. Please retry.");
          setQuizData(prev => ({
            ...prev,
            [comicId]: data.questions || []
          }));
        } catch (err) {
          const errorMsg = err?.response?.data?.error || err.message || "Failed to generate quiz";
          console.error('❌ Quiz generation failed:', errorMsg);
          setQuizError(errorMsg);
        } finally {
          setQuizLoading(false);
        }
      })(),

      // FAQ
      only.faq && (async () => {
        setFaqLoading(true);
        setFaqError("");
        try {
          console.log('❓ Starting FAQ generation...');
          const { data } = await API.post("/user/generate-faqs", {
            comicId,
            story: pages.length > 0 ? pages : JSON.parse(prompt)
          });
          console.log('✅ FAQ generated:', data.faqs?.length, 'FAQs');
          if (!data.faqs?.length) throw new Error("No FAQs were generated. Please retry.");
          setFaqData(prev => ({
            ...prev,
            [comicId]: data.faqs || []
          }));
        } catch (err) {
          const errorMsg = err?.response?.data?.error || err.message || "Failed to generate FAQs";
          console.error('❌ FAQ generation failed:', errorMsg);
          setFaqError(errorMsg);
        } finally {
          setFaqLoading(false);
        }
      })(),

      // Facts
      only.fact && (async () => {
        setFactLoading(true);
        setFactError("");
        try {
          console.log('💡 Starting Facts generation...');
          const { data } = await API.post("/user/generate-didyouknow", {
            comicId,
            subject: subjectName,
            story: story || pages.join(' ') || JSON.parse(prompt).map(p => p.description).join(' '),
          });
          console.log('✅ Facts generated:', data.didYouKnow?.length, 'facts');
          if (!data.didYouKnow?.length) throw new Error("No facts were generated. Please retry.");
          setFactData(prev => ({
            ...prev,
            [comicId]: data.didYouKnow || []
          }));
        } catch (err) {
          const errorMsg = err?.response?.data?.error || err.message || "Failed to generate facts";
          console.error('❌ Facts generation failed:', errorMsg);
          setFactError(errorMsg);
        } finally {
          setFactLoading(false);
        }
      })(),

      // Hardcore Quiz - FIXED VERSION
      only.hardcore && (async () => {
        setHardcoreQuizLoading(true);
        setHardcoreQuizError("");
        try {
          console.log('🔥 Starting Hardcore Quiz generation...');
          console.log('📋 Parameters:', {
            comicId,
            script: prompt?.substring(0, 100) + '...', // Log first 100 chars
            subject: subjectName,
            concept,
            grade: classGrade,
          });

          const { data } = await API.post("/user/generate-hardcore-quiz", {
            comicId,
            script: prompt, // Make sure this is the full prompt
            subject: subjectName,
            concept,
            grade: classGrade,
          });

          console.log('🔥 Hardcore Quiz API Response:', data);
          console.log('✅ Hardcore Quiz generated:', data.questions?.length, 'questions');

          if (data.questions && data.questions.length > 0) {
            setHardcoreQuizData(prev => ({
              ...prev,
              [comicId]: data.questions,
            }));
          } else {
            throw new Error("No questions returned from hardcore quiz API");
          }
        } catch (err) {
          const errorMsg = err?.response?.data?.error || err.message || "Failed to generate hardcore quiz";
          console.error('❌ Hardcore Quiz generation failed:', err);
          console.error('❌ Error details:', err.response?.data);
          setHardcoreQuizError(errorMsg);
        } finally {
          setHardcoreQuizLoading(false);
        }
      })()
    ];

    // Wait for all content to generate (but don't block UI)
    const results = await Promise.allSettled(promises.filter(Boolean));
    console.log('🎉 All content generation completed:', results);
  };

  // Step 4 par content tabhi banta tha jab images isi session me bani ho.
  // Resume (images pehle se) wale comic par kuch generate hi nahi hota tha aur
  // button "Generating Content..." par atka rehta tha. Ab: pehle saved content
  // load karo, jo missing hai sirf wahi generate karo (duplicate na bane).
  useEffect(() => {
    if (step !== 4 || !comicId || contentCheckedRef.current === comicId) return;
    contentCheckedRef.current = comicId;

    const loadOrGenerateContent = async () => {
      let saved = {};
      try {
        const res = await API.get(`/user/comic-reader/${comicId}`);
        saved = res.data?.data || {};
      } catch (err) {
        console.error("Saved content load failed:", err);
      }

      const savedQuiz = saved.quiz?.[0]?.questions || [];
      const savedHardcore = saved.hardcoreQuiz?.[0]?.questions || [];
      const savedFaqs = saved.faqs || [];
      const savedFacts = saved.facts || [];

      if (savedQuiz.length) setQuizData(prev => ({ ...prev, [comicId]: savedQuiz }));
      if (savedHardcore.length) setHardcoreQuizData(prev => ({ ...prev, [comicId]: savedHardcore }));
      if (savedFaqs.length) setFaqData(prev => ({ ...prev, [comicId]: savedFaqs }));
      if (savedFacts.length) setFactData(prev => ({ ...prev, [comicId]: savedFacts }));

      const missing = {
        quiz: !savedQuiz.length && !(quizData[comicId]?.length > 0),
        hardcore: !savedHardcore.length && !(hardcoreQuizData[comicId]?.length > 0),
        faq: !savedFaqs.length && !(faqData[comicId]?.length > 0),
        fact: !savedFacts.length && !(factData[comicId]?.length > 0),
      };
      if (Object.values(missing).some(Boolean)) {
        await generateAllContent(missing);
      }
    };

    loadOrGenerateContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, comicId]);

  const retryFailedContent = () => {
    trackClick("retry_content_generation_click", { comic_id: comicId || "" });
    generateAllContent({
      quiz: !!quizError,
      faq: !!faqError,
      fact: !!factError,
      hardcore: !!hardcoreQuizError,
    });
  };

  // ✅ IMPROVED: STEP 2: Prompt → Images with REALISTIC PROGRESS
  const handleGenerateComic = async (e) => {
    e.preventDefault();
    trackClick("generate_my_comic_click", {
      comic_id: comicId || "",
      part_number: currentPart?.part || "",
      script_edited: scriptEditedRef.current,
      script_changed: scriptEditedRef.current && prompt !== originalPromptRef.current,
    });
    setErrorMsg("");
    setSuccessMsg("");
    setLoadingImage(true);
    setIsGenerating(true);
    setProgress(0);
    setEstimatedTime("Starting comic generation...");
    setCurrentGeneratingPage(0);
    setComicImages([]);
    setEditedPages([]);

    try {
      let finalPages = pages;

      try {
        const maybeParsed = JSON.parse(prompt);
        if (Array.isArray(maybeParsed)) {
          finalPages = maybeParsed;
          setPages(maybeParsed);
        }

      } catch {
        // keep previous pages
      }

      const total = finalPages.length || 1;
      setTotalPages(total);

      // 🎯 REALISTIC PROGRESS SIMULATION
      let completedPages = 0;
      let progressInterval;

      // Start progress simulation
      const startProgressSimulation = () => {
        let simulatedProgress = 0;
        let currentSimulatedPage = 0;

        progressInterval = setInterval(() => {
          if (currentSimulatedPage < total) {
            // Simulate realistic page-by-page progress
            const baseProgress = (currentSimulatedPage / total) * 100;
            const pageProgress = Math.min(25, Math.random() * 30); // Each page takes 25-30% progress
            simulatedProgress = Math.min(95, baseProgress + pageProgress);

            setProgress(Math.round(simulatedProgress));
            setCurrentGeneratingPage(currentSimulatedPage + 1);
            setEstimatedTime(`Generating page ${currentSimulatedPage + 1}/${total}...`);

            // Randomly move to next page (simulating actual processing)
            if (Math.random() > 0.6) {
              currentSimulatedPage++;
            }
          } else {
            clearInterval(progressInterval);
          }
        }, 2000); // Update every 2 seconds
      };

      // Start the progress simulation
      startProgressSimulation();

      // 🧠 REAL API CALL
      console.log('🚀 Starting comic generation for', total, 'pages...');

      // Har image ke saath page number + panels bhi, taaki baad me single page edit ho sake
      const toImage = (img, index) => {
        const scriptPage =
          finalPages.find((p) => Number(p.page) === Number(img.page)) || finalPages[index];

        return {
          page: img.page ?? index + 1,
          imageUrl: img.imageUrl,
          panels: scriptPage?.panels || [],
          caption:
            scriptPage?.panels?.map((p) => p.caption).filter(Boolean).join("\n") ||
            scriptPage?.caption ||
            "",
        };
      };

      // Jo page select hai wahi rahe (user page 4 dekh raha ho to page 1 pe na kude)
      const keepSelection = (imgs) =>
        setSelectedImage((prev) =>
          (prev && imgs.find((i) => Number(i.page) === Number(prev.page))) || imgs[0]
        );

      // 📡 LIVE PAGES: request chal rahi ho tab tak bane hue pages turant dikhao
      setPagesGenerating(true);
      let livePagesStopped = false;
      const fetchLivePages = async () => {
        try {
          const res = await API.get(`/user/comics/${comicId}`);
          if (livePagesStopped) return;
          const ready = (res.data?.pages || [])
            .filter((p) => p.imageUrl)
            .sort((a, b) => a.pageNumber - b.pageNumber)
            .map((p, i) => toImage({ page: p.pageNumber, imageUrl: p.imageUrl }, i));
          if (ready.length === 0) return;

          if (progressInterval) clearInterval(progressInterval);
          setProgress(Math.min(99, Math.round((ready.length / total) * 100)));
          setCurrentGeneratingPage(Math.min(total, ready.length + 1));
          setEstimatedTime(`${ready.length} of ${total} pages ready...`);
          setComicImages(ready);
          keepSelection(ready);
        } catch {
          // agle tick pe phir try
        }
      };
      const livePagesTimer = setInterval(fetchLivePages, 3000);

      let data;
      try {
        ({ data } = await API.post("/user/generate-comic", {
          comicId,
          pages: finalPages,
        }));
      } finally {
        livePagesStopped = true;
        clearInterval(livePagesTimer);
        setPagesGenerating(false);
      }

      // Clear the simulation interval
      if (progressInterval) {
        clearInterval(progressInterval);
      }

      // 🖼️ Process actual images
      const imgs = (data?.images || [])
        .filter((img) => img.imageUrl)
        .map(toImage);
      if (imgs.length === 0) throw new Error("No images generated.");

      // ✅ FINAL PROGRESS - Show actual completion
      setProgress(100);
      setCurrentGeneratingPage(total);
      setEstimatedTime("Completed! Generating additional content...");

      // ✅ UPDATE UI WITH ACTUAL IMAGES
      setComicImages(imgs);
      keepSelection(imgs);

      // ✅ AUTO-GENERATE ALL CONTENT
      console.log('🎨 Comic images generated, starting content generation...');
      await generateAllContent();

      setLoadingImage(false);
      setIsGenerating(false);

      console.log("Generated images:", data.images);

    } catch (err) {
      console.error(err);
      setErrorMsg(err?.response?.data?.error || err.message || "Error generating comic images.");
      setLoadingImage(false);
      setIsGenerating(false);
      setProgress(0);
      setEstimatedTime("Failed");
    }
  };

  // ✏️ Ek page dobara bana -> sirf wahi image badlo, baaki waise ke waise
  const handlePageRegenerated = ({ page, imageUrl, panels, caption }) => {
    const updatePage = (img) =>
      img?.page === page ? { ...img, imageUrl, panels, caption } : img;

    setComicImages((prev) => prev.map(updatePage));
    setSelectedImage((prev) => updatePage(prev));

    // Script bhi update, taaki FAQ / quiz / dobara generate me naya version jaye
    setPages((prev) => prev.map((p) => (Number(p.page) === page ? { ...p, panels } : p)));
    setPrompt((prev) => {
      try {
        const script = JSON.parse(prev);
        return JSON.stringify(
          script.map((p) => (Number(p.page) === page ? { ...p, panels } : p)),
          null,
          2
        );
      } catch {
        return prev;
      }
    });

    setEditedPages((prev) => [...new Set([...prev, page])]);

    // Purani PDF me purani image hai -> dobara banani padegi
    setPdfUrl("");
    setErrorMsg("");
    setSuccessMsg(`Page ${page} updated. Click "Generate Comic PDF" to include the new image.`);
  };

  // STEP 3: Generate PDF
  const handleGeneratePDF = async () => {
    trackClick("generate_comic_pdf_click", {
      comic_id: comicId || "",
      part_number: currentPart?.part || "",
      total_images: comicImages?.length || 0,
    });
    setErrorMsg("");
    setSuccessMsg("");
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
    trackClickWithUser("final_submit_click", {
      comic_id: comicId || "",
      part_number: currentPart?.part || "",
      total_parts: parts.length,
    });
    dispatch(setComicStatus(comicId, "published"));

    // mark current part as completed
    setCompletedParts((prev) => [...new Set([...prev, comicId])]);

    // ✅ redirect back to Concept Breakdown (Step 1)
    setStep(1);
  };

  // Helper functions
  // Lal star (RequiredMark) wale saare fields bhare hone chahiye
  const isStep0Valid = story?.trim()?.length > 0 && story.length <= STORY_MAX && comicTitle.trim() && subject.trim() &&
    classGrade && concept.trim() && themeType && styleType &&
    (!isCustomTheme || customTheme.trim()) && (!isCustomStyle || customStyle.trim());

  const resetAfterBackToPrompt = () => {
    setComicImages([]);
    setPdfUrl("");
    setSelectedImage(null);
    setEditedPages([]);
  };



  const isEverythingGenerated =
    pdfUrl &&
    comicImages.length > 0 &&
    quizData[comicId]?.length > 0 &&
    faqData[comicId]?.length > 0 &&
    factData[comicId]?.length > 0 &&
    hardcoreQuizData[comicId]?.length > 0 &&
    !quizLoading &&
    !faqLoading &&
    !factLoading &&
    !hardcoreQuizLoading;

  if (subLoading) {
    return (
      <div className="text-center py-5">
        <Spinner />
        <p>Checking subscription...</p>
      </div>
    );
  }



  const isWeeklyLimitReached =
    subscription?.comicsPerWeek > 0 &&
    subscription?.comicsLeft === 0;

  // Backend unlimited plan ke liye comicsPerWeek / comicsLeft = -1 bhejta hai
  const isUnlimitedPlan =
    !!subscription?.isUnlimited || subscription?.comicsPerWeek < 0;

  // "Convert to Prompt" ke paas dikhane ke liye: kaun se required field bache hain
  const missingStep0Fields = [
    !classGrade && "Class/Grade",
    !subject && "Subject",
    !comicTitle.trim() && "Comic title",
    !concept.trim() && "Concept",
    !themeType && "Theme",
    isCustomTheme && !customTheme.trim() && "Custom theme",
    !styleType && "Style",
    isCustomStyle && !customStyle.trim() && "Custom style",
    !story.trim() && "Story",
  ].filter(Boolean);


  return (
    <div className="homePage py-5">
      <div className="container-xl">
        <div className="custom-wrapper mx-auto" style={{ maxWidth: "1000px" }}>
          <div className="wrapper pb-1">
            <Stepper currentStep={step} />

            {subscription?.hasSubscription && (
              <div className="cg-usage mb-4">
                <span className="cg-usage-icon" aria-hidden="true">
                  <i className="bi bi-bar-chart-fill"></i>
                </span>
                <div className="cg-usage-body">
                  <div className="cg-usage-title">This week</div>
                  <div className="cg-usage-sub">
                    {isUnlimitedPlan
                      ? "Unlimited comics on your plan"
                      : `${subscription.usedThisWeek || 0} of ${subscription.comicsPerWeek || 0} comics created`}
                  </div>
                  {!isUnlimitedPlan && subscription.comicsPerWeek > 0 && (
                    <div className="cg-usage-bar">
                      <span
                        style={{
                          width: `${Math.min(100, ((subscription.usedThisWeek || 0) / subscription.comicsPerWeek) * 100)}%`,
                        }}
                      ></span>
                    </div>
                  )}
                </div>
                <span
                  className={`cg-usage-badge ${isUnlimitedPlan ? "is-unlimited" : subscription.comicsLeft === 0 ? "is-empty" : ""}`}
                >
                  {isUnlimitedPlan ? (
                    <><i className="bi bi-infinity me-1"></i>Unlimited</>
                  ) : (
                    `${subscription.comicsLeft} left`
                  )}
                </span>
              </div>
            )}
          </div>



          {/* Debug Step Control (optional for development) */}
          {/* <div className="d-flex gap-2 mb-3">
            <Button variant="outline-primary" onClick={() => setStep(0)}>Step 0: Story</Button>
            <Button variant="outline-primary" onClick={() => setStep(1)}>Step 1: Breakdown</Button>
            <Button variant="outline-primary" onClick={() => setStep(2)}>Step 2: Prompt</Button>
            <Button variant="outline-primary" onClick={() => setStep(3)}>Step 3: Preview</Button>
            <Button variant="outline-primary" onClick={() => setStep(4)}>Step 4: Publish</Button>
          </div> */}

          {successMsg && (
            <Alert variant="success" className="mb-4" dismissible onClose={() => setSuccessMsg("")}>
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
              <Form onSubmit={handleConvertToPrompt} className="cg-story-form">
                <div className="cg-story-head">
                  <div>
                    <div className="fs-3 fw-bold text-dark">Write your story</div>
                    <div className="cg-story-lead">
                      Tell us what to teach and share your story idea. We'll turn it into an illustrated comic series.
                    </div>
                    {resumeComicId && (
                      <div className="text-muted small mt-1">Resuming comic creation...</div>
                    )}
                  </div>
                  <div className="cg-how" aria-label="How it works">
                    <span><i className="bi bi-pencil"></i>Story</span>
                    <i className="bi bi-chevron-right cg-how-sep" aria-hidden="true"></i>
                    <span><i className="bi bi-collection"></i>Parts</span>
                    <i className="bi bi-chevron-right cg-how-sep" aria-hidden="true"></i>
                    <span><i className="bi bi-images"></i>Comic</span>
                  </div>
                </div>

                {/* Saare fields ek hi card me (purana layout: 3 columns) */}
                <section className="cg-section">
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
                        <Form.Label>Class/Grade<RequiredMark /></Form.Label>
                        <Form.Select
                          value={classGrade}
                          required
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
                        <Form.Label>Subject<RequiredMark /></Form.Label>
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
                          <span>Theme<RequiredMark /></span>
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
                          <option value={CUSTOM_OPTION}>✏️ Custom theme...</option>
                        </Form.Select>
                        {isCustomTheme && (
                          <>
                            <Form.Control
                              className="mt-2"
                              type="text"
                              value={customTheme}
                              maxLength={CUSTOM_TEXT_MAX}
                              onChange={(e) => setCustomTheme(e.target.value)}
                              placeholder="e.g. Space adventure, Jungle mystery"
                              autoFocus
                            />
                            <Form.Text className="d-flex justify-content-between">
                              <span>Only for this comic</span>
                              <span>{customTheme.length}/{CUSTOM_TEXT_MAX}</span>
                            </Form.Text>
                          </>
                        )}
                      </Form.Group>
                    </Col>
                    <Col sm={6} md={4}>
                      <Form.Group>
                        <Form.Label className="d-flex align-items-center gap-2">
                          <span>Choose Style<RequiredMark /></span>
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
                          <option value={CUSTOM_OPTION}>✏️ Custom style...</option>
                        </Form.Select>
                        {isCustomStyle && (
                          <>
                            <Form.Control
                              className="mt-2"
                              type="text"
                              value={customStyle}
                              maxLength={CUSTOM_TEXT_MAX}
                              onChange={(e) => setCustomStyle(e.target.value)}
                              placeholder="e.g. Neon, Watercolor, Pixel art"
                              autoFocus
                            />
                            <Form.Text className="d-flex justify-content-between">
                              <span>Only for this comic</span>
                              <span>{customStyle.length}/{CUSTOM_TEXT_MAX}</span>
                            </Form.Text>
                          </>
                        )}
                      </Form.Group>
                    </Col>
                    <Col sm={6} md={4}>
                      <Form.Group>
                        <Form.Label>Comic Title<RequiredMark /></Form.Label>
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
                        <Form.Label>Concept<RequiredMark /></Form.Label>
                        <Form.Control
                          type="text"
                          value={concept}
                          onChange={(e) => setConcept(e.target.value)}
                          placeholder="e.g. photosynthesis"
                        />
                      </Form.Group>
                    </Col>
                    <Col sm={6} md={4}>
                      <Form.Group>
                        <Form.Label className="d-flex align-items-center gap-2">
                          Comic Image Type
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Select type and click info icon to preview</Tooltip>}
                          >
                            <i
                              className="bi bi-info-circle text-primary"
                              role="button"
                              onClick={() => setShowComicTypeModal(true)}
                            />
                          </OverlayTrigger>
                        </Form.Label>
                        <Form.Select
                          value={showTextInImage ? "text" : "image"}
                          onChange={(e) => setShowTextInImage(e.target.value === "text")}
                        >
                          <option value="text">With Text & Dialogue</option>
                          <option value="image">No Text - Just Visual Story</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    {/* Story (poori width) */}
                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label>Write Story<RequiredMark /></Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={7}
                          className="cg-story-input"
                          value={story}
                          maxLength={STORY_MAX}
                          onChange={(e) => setStory(e.target.value.slice(0, STORY_MAX))}
                          placeholder="e.g. Asha and her robot friend Bolt shrink down to explore a leaf. They meet tiny chloroplast workers who show them how sunlight, water and air are turned into food for the plant..."
                          isInvalid={story.length > STORY_MAX}
                        />
                        <div className="cg-story-meter">
                          <div className="cg-story-meter-bar">
                            <span
                              className={story.length >= STORY_MAX ? "is-full" : story.length > STORY_MAX * 0.9 ? "is-near" : ""}
                              style={{ width: `${Math.min(100, (story.length / STORY_MAX) * 100)}%` }}
                            ></span>
                          </div>
                          <span className={story.length >= STORY_MAX ? "text-danger" : ""}>
                            {story.length.toLocaleString()}/{STORY_MAX.toLocaleString()}
                          </span>
                        </div>
                        {story.length > STORY_MAX && (
                          <div className="text-danger small mt-1">
                            Story is too long. Please shorten it to {STORY_MAX} characters.
                          </div>
                        )}
                      </Form.Group>

                      <div className="cg-story-tips">
                        <span className="cg-story-tips-label"><i className="bi bi-lightbulb me-1"></i>Tips</span>
                        <span>Name your main characters</span>
                        <span>Say where it happens</span>
                        <span>What do they discover or solve?</span>
                      </div>
                    </Col>
                  </Row>
                </section>

                {/* Submit */}
                <div className="cg-submit">
                  <div className="cg-submit-status">
                    {missingStep0Fields.length === 0 ? (
                      <span className="text-success">
                        <i className="bi bi-check-circle-fill me-1"></i>All set! Ready to plan your comic.
                      </span>
                    ) : (
                      <span>
                        <i className="bi bi-list-check me-1"></i>
                        Still needed: {missingStep0Fields.join(", ")}
                      </span>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="cg-submit-btn"
                    disabled={
                      !isStep0Valid ||
                      loadingPrompt ||
                      isWeeklyLimitReached ||
                      isDashboardOnly
                    }
                  >
                    {isDashboardOnly ? (
                      "Upgrade to Bundle to Create Comics"
                    ) : isWeeklyLimitReached ? (
                      "Weekly Limit Reached"
                    ) : loadingPrompt ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Planning your comic...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-magic me-2"></i>Convert to Prompt
                      </>
                    )}
                  </Button>
                </div>

                {loadingPrompt && (
                  <GenerationLoader
                    icon="bi-magic"
                    title="Planning your comic series"
                    messages={PROMPT_LOADING_MESSAGES}
                    hint="Usually takes under a minute. Please keep this page open."
                  />
                )}

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
                      <Button variant="primary" onClick={() => {
                        trackClick("go_to_my_comics_click", { location: "create_comic_existing_comic" });
                        navigate("/my-comics");
                      }}>
                        Go to My Comics
                      </Button>
                    </div>
                  </div>
                )}

                {selectedCountry?.value && (
                  <div className="mt-5 p-4 border rounded bg-white">
                    <h4 className="mb-3">🌍 Public Comics Library</h4>
                    <p className="text-muted">Showing comics based on your selections above</p>

                    {/* TABLE */}
                    <table className="table table-bordered mt-3">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Concept</th>
                          <th>Grade</th>
                          <th>Country</th>
                          <th>Subject</th>
                        </tr>
                      </thead>
                      <tbody>
                        {publicComics.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center text-muted">
                              No comics found matching your selections
                            </td>
                          </tr>
                        ) : (
                          publicComics.map((c) => (
                            <tr key={c._id}>
                              <td>{c.title}</td>
                              <td>{c.concept}</td>
                              <td>{c.grade}</td>
                              <td>{c.country}</td>
                              <td>{c.subject}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>

                    {/* PAGINATION */}
                    <div className="d-flex justify-content-between mt-3">
                      <Button
                        disabled={pubPage === 1}
                        onClick={() => loadPublicComics(pubPage - 1)}
                      >
                        Previous
                      </Button>

                      <span>Page {pubPage} / {pubTotalPages}</span>

                      <Button
                        disabled={pubTotalPages === pubPage}
                        onClick={() => loadPublicComics(pubPage + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}



              </Form>
            )}

            {/* STEP 1: Concept Breakdown */}
            {step === 1 && (
              <div>
                <div className="fs-3 fw-bold mb-1">Concept Breakdown</div>
                <p className="text-muted">Your story has been planned as a series. Create each part as an 8-page comic.</p>

                {parts.length === 0 ? (
                  <Alert variant="warning">No parts returned from backend.</Alert>
                ) : (
                  <PartsBreakdown
                    parts={parts}
                    seriesTitle={comicTitle}
                    completedParts={completedParts}
                    isFreeUser={isFreeUser}
                    writingPartNumber={writingPartNumber}
                    onStart={loadPartData}
                    onRetry={retryPartScript}
                    onUpgrade={() => navigate("/subscriptions-plan")}
                    onViewMyComics={() => navigate("/my-comics")}
                  />
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
                    <div className="fs-5 fw-semibold mb-1">Comic Script</div>
                    <p className="text-muted small mb-3">
                      Review each page and edit the scene, caption or dialogue before generating your comic.
                    </p>
                    <div className="mb-3">
                      <ScriptEditor value={prompt} onChange={handleScriptChange} />
                    </div>

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
                            <Spinner size="sm" className="me-2" /> Drawing your comic...
                          </>
                        ) : (
                          "Generate My Comic"
                        )}
                      </Button>
                    </div>

                    {/* IMPROVED PROGRESS DISPLAY */}
                    {isGenerating && (
                      <GenerationLoader
                        icon="bi-palette"
                        title="Drawing your comic"
                        messages={IMAGE_LOADING_MESSAGES}
                        status={estimatedTime}
                        progress={progress}
                        hint="Page 1 sets the art style, then the other pages are drawn together. Each page appears as soon as it's ready."
                      >
                        {totalPages > 0 && (
                          <div className="generation-loader-pages" aria-hidden="true">
                            {Array.from({ length: totalPages }, (_, i) => (
                              <span
                                key={i}
                                className={`generation-loader-page ${i < currentGeneratingPage - 1 ? "is-done" : i === currentGeneratingPage - 1 ? "is-active" : ""}`}
                              >
                                {i + 1}
                              </span>
                            ))}
                          </div>
                        )}
                      </GenerationLoader>
                    )}
                  </Form>
                ) : (
                  <>
                    {/* Pages ek-ek karke aa rahe hain - jo bane hain woh dekh sakte ho */}
                    {pagesGenerating && (
                      <div className="mb-4">
                        <GenerationLoader
                          icon="bi-palette"
                          title={`${comicImages.length} of ${totalPages} pages ready`}
                          messages={IMAGE_LOADING_MESSAGES.slice(2)}
                          progress={totalPages ? (comicImages.length / totalPages) * 100 : undefined}
                          hint="You can look at the finished pages while the rest are drawn."
                        />
                      </div>
                    )}

                    <Row>
                      <Col md={3} className="border-end pe-3" style={{ maxHeight: "500px", overflowY: "auto" }} ref={thumbnailsRef}>
                        <div className="d-flex flex-column gap-2">

                          {comicImages.map((img, idx) => {
                            const isSelected =
                              selectedImage &&
                              (img.page != null
                                ? Number(selectedImage.page) === Number(img.page)
                                : selectedImage.imageUrl === img.imageUrl);

                            return (
                              // Poora tile (image + caption) clickable button hai
                              <button
                                type="button"
                                key={img.page ?? idx}
                                className={`comic-thumb-tile ${isSelected ? "is-selected" : ""}`}
                                onClick={() => setSelectedImage(img)}
                                aria-pressed={!!isSelected}
                                aria-label={`Open page ${img.page ?? idx + 1}`}
                                title={`Open page ${img.page ?? idx + 1}`}
                              >
                                <span className="comic-thumb-img-wrap">
                                  <img
                                    src={img.imageUrl}
                                    alt={`comic page ${img.page ?? idx + 1}`}
                                    className="comic-thumb-img"
                                    draggable={false}
                                  />
                                  <span className="comic-thumb-page">
                                    {img.page ?? idx + 1}
                                  </span>
                                </span>

                                {editedPages.includes(img.page) && (
                                  <span className="d-block">
                                    <Badge bg="success" className="mt-1">Edited</Badge>
                                  </span>
                                )}
                              </button>
                            );
                          })}


                        </div>
                      </Col>

                      <Col md={9} className="d-flex justify-content-center align-items-center">

                        {selectedImage ? (
                          <div className="text-center">
                            <ZoomImage
                              // page badle to component naya bane (purana zoom/hover state na bache)
                              key={`${selectedImage.page ?? ""}-${selectedImage.imageUrl}`}
                              src={selectedImage.imageUrl}
                              alt="selected-comic"
                              style={{
                                maxWidth: "100%",
                                maxHeight: "500px",
                                borderRadius: "8px",
                                border: "2px solid #ccc",
                              }}
                            />

                            {selectedImage.caption && (
                              <div className="mt-3">
                                <Badge bg="dark" className="p-2">
                                  {selectedImage.caption}
                                </Badge>
                              </div>
                            )}

                            {/* ✏️ Sirf is page ko edit + regenerate */}
                            {selectedImage.page && (
                              <div className="mt-3">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  disabled={publishing || pagesGenerating}
                                  onClick={() => {
                                    trackClick("edit_comic_page_click", {
                                      comic_id: comicId || "",
                                      page_number: selectedImage.page,
                                    });
                                    setEditingPage(selectedImage);
                                  }}
                                >
                                  <i className="bi bi-pencil-square me-1"></i>
                                  Edit page {selectedImage.page}
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-muted">
                            Click on a thumbnail to preview the image.
                          </p>
                        )}

                      </Col>
                    </Row>

                    <div className="btn-wrapper mt-4 d-flex gap-3 justify-content-center">
                      <Button
                        variant="warning"
                        disabled={pagesGenerating}
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
                        disabled={publishing || pagesGenerating}
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

            {/* STEP 4: Publish - NOW WITH AUTO-GENERATED CONTENT */}
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

                {/* Additional Content Sections - NOW AUTO-GENERATED */}
                <div className="mt-5 text-start">

                  {/* Loading indicators for all content */}
                  {(quizLoading || faqLoading || factLoading || hardcoreQuizLoading) && (
                    <Alert variant="info" className="mb-4">
                      <Spinner size="sm" className="me-2" />
                      Generating additional content... This may take a few moments.
                    </Alert>
                  )}

                  {/* Quiz Section */}
                  <div className="quiz-wrapper mt-4">
                    <h4>📝 Quiz for this Comic</h4>
                    {quizLoading && <Spinner size="sm" className="me-2" />}
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
                    <h4>🔥 Hardcore Quiz (Challenge Mode)</h4>

                    {hardcoreQuizLoading ? (
                      <div className="d-flex align-items-center gap-2 mb-3">
                        <Spinner size="sm" variant="danger" />
                        <span>Generating hardcore quiz questions...</span>
                      </div>
                    ) : hardcoreQuizError ? (
                      <Alert variant="danger" className="mb-3">
                        <strong>Error:</strong> {hardcoreQuizError}
                      </Alert>
                    ) : hardcoreQuizData?.[comicId]?.length > 0 ? (
                      <div className="hardcore-quiz-questions mt-4">
                        <Alert variant="success" className="mb-3">
                          ✅ Generated {hardcoreQuizData?.[comicId]?.length} hardcore questions!
                        </Alert>

                        {hardcoreQuizData?.[comicId]?.map((q, idx) => (
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
                    ) : (
                      <Alert variant="warning" className="mb-3">
                        No hardcore quiz generated yet.
                      </Alert>
                    )}
                  </div>


                  {/* FAQ Section */}
                  <div className="faq-wrapper mt-5">
                    <h4>❓ FAQs for this Comic</h4>
                    {faqLoading && <Spinner size="sm" className="me-2" />}
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
                    <h4>💡 Did You Know Facts</h4>
                    {factLoading && <Spinner size="sm" className="me-2" />}
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

                <div className="d-flex flex-wrap gap-3 justify-content-center mt-4">
                  {(quizError || faqError || factError || hardcoreQuizError) &&
                    !(quizLoading || faqLoading || factLoading || hardcoreQuizLoading) && (
                      <Button variant="outline-danger" onClick={retryFailedContent}>
                        <i className="bi bi-arrow-clockwise me-2"></i>
                        Retry Failed Content
                      </Button>
                    )}

                  {/* <Button onClick={handlePublish}>
                    Final Submit
                  </Button> */}

                  <Button
                    onClick={handlePublish}
                    disabled={!isEverythingGenerated}
                  >
                    {isEverythingGenerated ? "Final Submit" : "Generating Content..."}
                  </Button>


                  <Button variant="outline-primary" onClick={() => {
                    trackClick("go_to_my_comics_click", { location: "create_comic_publish_step", comic_id: comicId || "" });
                    navigate("/my-comics");
                  }}>
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
          <Modal.Title>{isCustomTheme ? "Custom" : themeType} Theme</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 text-start">
          <h5 className="mb-3">Description</h5>
          <p>
            {isCustomTheme
              ? (customTheme.trim() || "Type your own theme in the box below the dropdown. It is used only for this comic.")
              : (themes.find(t => t.name === themeType)?.description || "No description available")}
          </p>
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



      <Modal
        show={showComicTypeModal}
        onHide={() => setShowComicTypeModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {showTextInImage
              ? "Comics With Text"
              : "Comics Without Text"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="text-center">

          <img
            src={showTextInImage ? forComics : forImage}
            alt="preview"
            className="img-fluid rounded"
          />

          <div className="mt-2">
            {showTextInImage ? (
              <p>
                Images will contain captions, labels, speech bubbles
                and educational text.
              </p>
            ) : (
              <p>
                Images will be generated without any text,
                captions or speech bubbles.
              </p>
            )}
          </div>

        </Modal.Body>
      </Modal>

      {/* ✏️ Single page edit modal */}
      <EditComicPageModal
        show={!!editingPage}
        onHide={() => setEditingPage(null)}
        comicId={comicId}
        page={editingPage}
        onRegenerated={handlePageRegenerated}
      />
    </div>
  );
};

export default ComicGenerator;