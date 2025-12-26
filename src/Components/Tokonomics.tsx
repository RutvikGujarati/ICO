import { Container, Row, Col, Card } from 'react-bootstrap';

const styles = {
    glass: {
        background: 'rgba(13, 18, 30, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
    },
    gradientText: {
        background: 'linear-gradient(to right, #fff, #94a3b8)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
    }
};

const tokenomicsData = [
    { label: "Community Sale", pct: 50, color: "info", desc: "Public Presale Allocation" },
    { label: "Founders & Team", pct: 25, color: "primary", desc: "12-Month Linear Vesting" },
    { label: "Venture Capital", pct: 15, color: "warning", desc: "Strategic Partnerships" },
    { label: "Marketing", pct: 10, color: "danger", desc: "Global Awareness & CEX Listings" }
];

export default function TokenomicsSection() {
    return (
        <Container className="py-5" id="tokenomics">
            <div className="text-center mb-5">
                <h2 className="display-5 fw-bold mb-3" style={styles.gradientText}>Tokenomics</h2>
                <p className="text-secondary lead">Strategic distribution designed for long-term sustainability.</p>
            </div>

            <Row className="justify-content-center">
                <Col lg={10} xl={9}>
                    <Card style={styles.glass} className="border-0 rounded-5 text-white overflow-hidden">
                        <Card.Body className="p-0">
                            <Row className="g-0">
                                {/* Left Side: Key Metrics */}
                                <Col md={5} className="p-5 d-flex flex-column justify-content-center align-items-center text-center position-relative" 
                                     style={{ background: 'linear-gradient(135deg, rgba(13,202,240,0.15) 0%, rgba(11,14,23,0.9) 100%)' }}>
                                    
                                    <div className="mb-5">
                                        <small className="text-info fw-bold letter-spacing-2 text-uppercase d-block mb-2">Total Supply</small>
                                        <h2 className="display-4 fw-bold mb-0">10M</h2>
                                        <span className="text-white-50 small">DMX TOKENS</span>
                                    </div>

                                    <div>
                                        <small className="text-success fw-bold letter-spacing-2 text-uppercase d-block mb-2">Launch Target</small>
                                        <h2 className="display-4 fw-bold mb-0">$10</h2>
                                        <span className="text-white-50 small">PER TOKEN</span>
                                    </div>
                                    
                                    {/* Decorative Circle */}
                                    <div style={{ position: 'absolute', width: '200%', height: '100%', top: 0, left: '-50%', background: 'radial-gradient(circle, rgba(13,202,240,0.1) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
                                </Col>

                                {/* Right Side: Distribution Bars */}
                                <Col md={7} className="p-4 p-md-5 bg-dark bg-opacity-25">
                                    <h4 className="fw-bold mb-4">Allocation Breakdown</h4>
                                    <div className="d-flex flex-column gap-4">
                                        {tokenomicsData.map((item, index) => (
                                            <div key={index}>
                                                <div className="d-flex justify-content-between align-items-end mb-2">
                                                    <div>
                                                        <span className="fw-bold text-white d-block">{item.label}</span>
                                                        <small className="text-secondary" style={{ fontSize: '0.8rem' }}>{item.desc}</small>
                                                    </div>
                                                    <span className={`fw-bold text-${item.color} fs-5`}>{item.pct}%</span>
                                                </div>
                                                <div className="progress" style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                                                    <div 
                                                        className={`progress-bar bg-${item.color}`} 
                                                        role="progressbar" 
                                                        style={{ width: `${item.pct}%`, borderRadius: '10px', boxShadow: `0 0 10px var(--bs-${item.color})` }} 
                                                        aria-valuenow={item.pct} 
                                                        aria-valuemin={0} 
                                                        aria-valuemax={100}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}