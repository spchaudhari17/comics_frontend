import React, { useEffect, useState } from "react";
import { Row, Col, Card, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import dataTableCustomStyles from "../../assets/styles/dataTableCustomStyles";
import { NoDataComponent } from "../../components/NoDataComponent";
import API from "../../API";
import { toast } from "react-toastify";

const AdUnitManager = () => {
    const navigate = useNavigate();

    const [units, setUnits] = useState([
        { platform: "Android", type: "Banner", id: "ca-app-pub-6424274444934844/7927940565", ecpm: "" },
        { platform: "Android", type: "Interstitial", id: "ca-app-pub-6424274444934844/9450675411", ecpm: "" },
        { platform: "Android", type: "Rewarded", id: "ca-app-pub-6424274444934844/5839650075", ecpm: "" },

        { platform: "iOS", type: "Banner", id: "ca-app-pub-6424274444934844/1697288723", ecpm: "" },
        { platform: "iOS", type: "Interstitial", id: "ca-app-pub-6424274444934844/2867185576", ecpm: "" },
        { platform: "iOS", type: "Rewarded", id: "ca-app-pub-6424274444934844/6192564364", ecpm: "" },
    ]);

    const sortByPlatformAndType = list => {
        const order = {
            android: ["Banner", "Interstitial", "Rewarded"],
            ios: ["Banner", "Interstitial", "Rewarded"]
        };

        const getPlatform = id => {
            if (id.endsWith("0565") || id.endsWith("5411") || id.endsWith("0075")) return "android";
            return "ios";
        };

        const getType = id => {
            if (id.endsWith("0565") || id.endsWith("8723")) return "Banner";
            if (id.endsWith("5411") || id.endsWith("5576")) return "Interstitial";
            return "Rewarded";
        };

        return list.sort((a, b) => {
            const pA = getPlatform(a.ad_unit_id);
            const pB = getPlatform(b.ad_unit_id);
            if (pA !== pB) return pA.localeCompare(pB);

            const tA = getType(a.ad_unit_id);
            const tB = getType(b.ad_unit_id);
            return order[pA].indexOf(tA) - order[pB].indexOf(tB);
        });
    };

    const [savedList, setSavedList] = useState([]);

    const loadExisting = async () => {
        const res = await API.get("/user/ecpm");
        const dbList = res.data.data;

        const updated = [...units];
        updated.forEach(u => {
            const match = dbList.find(d => d.ad_unit_id === u.id);
            if (match) u.ecpm = match.ecpm;
        });

        setUnits(updated);
        setSavedList(sortByPlatformAndType(dbList));
    };

    useEffect(() => {
        loadExisting();
    }, []);

    const updateEcpm = async (unit) => {
        if (unit.ecpm === "" || isNaN(unit.ecpm)) {
            return toast.error("Please enter a valid eCPM value");
        }

        await API.post("/user/ecpm", {
            ad_unit_id: unit.id,
            ecpm: Number(unit.ecpm),
            currency: "USD"
        });

        toast.success("ECPM Updated Successfully!");
        loadExisting();
    };

    // Table Columns
    const columns = [
        {
            name: "Platform",
            selector: row =>
                row.ad_unit_id.match(/0565|5411|0075/) ? "Android" : "iOS",
            minWidth: "150px",
            wrap: false
        },
        {
            name: "Type",
            selector: row => {
                if (row.ad_unit_id.endsWith("0565") || row.ad_unit_id.endsWith("8723")) return "Banner";
                if (row.ad_unit_id.endsWith("5411") || row.ad_unit_id.endsWith("5576")) return "Interstitial";
                return "Rewarded";
            },
            minWidth: "150px",
            wrap: false
        },
        {
            name: "Ad Unit ID",
            selector: row => row.ad_unit_id,
            minWidth: "360px",
            wrap: false
        },
        {
            name: "eCPM",
            selector: row => row.ecpm,
            minWidth: "150px",
            wrap: false
        },
        {
            name: "Currency",
            selector: row => row.currency,
            minWidth: "100px",
            wrap: false
        },
        {
            name: "Updated",
            selector: row =>
                new Date(row.updatedAt).toLocaleDateString() +
                " | " +
                new Date(row.updatedAt).toLocaleTimeString(),
            minWidth: "250px",
            wrap: false
        }
    ];

    return (
        <div className="py-4">
            <div className="container-xl">

                {/* HEADER */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="main-heading">Manage Ad Units – eCPM</h1>

                    <Button
                        variant="success"
                        onClick={() => navigate("/comic-revenue-report")}
                    >
                        📊 View Revenue Report
                    </Button>
                </div>

                {/* SUMMARY CARDS */}
                <Row className="g-3 mb-4">
                    <Col md={4}>
                        <div className="bg-info bg-opacity-25 rounded-4 border-bottom border-4 border-info p-3 text-center">
                            <div className="fs-3 fw-bold text-info">3</div>
                            <div className="fw-semibold text-muted">Android Units</div>
                        </div>
                    </Col>
                    <Col md={4}>
                        <div className="bg-primary bg-opacity-25 rounded-4 border-bottom border-4 border-primary p-3 text-center">
                            <div className="fs-3 fw-bold text-primary">3</div>
                            <div className="fw-semibold text-muted">iOS Units</div>
                        </div>
                    </Col>
                    <Col md={4}>
                        <div className="bg-success bg-opacity-25 rounded-4 border-bottom border-4 border-success p-3 text-center">
                            <div className="fs-3 fw-bold text-success">6</div>
                            <div className="fw-semibold text-muted">Total Units</div>
                        </div>
                    </Col>
                </Row>

                {/* ANDROID BLOCK */}
                <h3 className="mt-4 mb-3">Android Ad Units</h3>
                <Row className="g-3">
                    {units.filter(u => u.platform === "Android").map((u, i) => (
                        <Col md={4} key={i}>
                            <Card className="p-3 shadow-sm rounded-4">
                                <h5>{u.type}</h5>
                                <small className="text-muted">{u.id}</small>

                                <Form.Control
                                    className="mt-2"
                                    type="number"
                                    value={u.ecpm}
                                    placeholder="Enter eCPM"
                                    onChange={e => {
                                        const updated = [...units];
                                        const t = updated.find(x => x.id === u.id);
                                        t.ecpm = e.target.value;
                                        setUnits(updated);
                                    }}
                                />

                                <Button className="mt-3" onClick={() => updateEcpm(u)}>
                                    Update
                                </Button>
                            </Card>
                        </Col>
                    ))}
                </Row>

                {/* IOS BLOCK */}
                <h3 className="mt-5 mb-3">iOS Ad Units</h3>
                <Row className="g-3 mb-5">
                    {units.filter(u => u.platform === "iOS").map((u, i) => (
                        <Col md={4} key={i}>
                            <Card className="p-3 shadow-sm rounded-4">
                                <h5>{u.type}</h5>
                                <small className="text-muted">{u.id}</small>

                                <Form.Control
                                    className="mt-2"
                                    type="number"
                                    value={u.ecpm}
                                    placeholder="Enter eCPM"
                                    onChange={e => {
                                        const updated = [...units];
                                        const t = updated.find(x => x.id === u.id);
                                        t.ecpm = e.target.value;
                                        setUnits(updated);
                                    }}
                                />

                                <Button className="mt-3" onClick={() => updateEcpm(u)}>
                                    Update
                                </Button>
                            </Card>
                        </Col>
                    ))}
                </Row>

                {/* TABLE */}
                <div className="info-wrapper mt-4">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <h3 className="main-heading m-0">Saved eCPM Records</h3>
                    </div>

                    <div className="table-responsive table-custom-wrapper" style={{ overflowX: "auto" }}>
                        <DataTable
                            columns={columns}
                            data={savedList}
                            highlightOnHover
                            striped
                            pagination
                            responsive
                            customStyles={{
                                ...dataTableCustomStyles,
                                cells: {
                                    style: {
                                        whiteSpace: "nowrap",
                                        overflow: "visible",
                                        textOverflow: "clip"
                                    }
                                }
                            }}
                            noDataComponent={<NoDataComponent />}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdUnitManager;
