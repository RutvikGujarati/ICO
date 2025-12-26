import { Container, Row, Col, Badge } from 'react-bootstrap';

const styles = {
    glass: {
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    activeGlass: {
        background: 'linear-gradient(180deg, rgba(13, 202, 240, 0.15) 0%, rgba(13, 202, 240, 0.05) 100%)',
        backdropFilter: 'blur(12px)',
        border: '1px solid #0dcaf0',
        transform: 'scale(1.08)',
        boxShadow: '0 10px 40px -10px rgba(13, 202, 240, 0.3)',
        zIndex: 2
    },
    gradientText: {
        background: 'linear-gradient(to right, #fff, #94a3b8)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
    }
};

interface PresaleData {
    currentPhase: number;
}

export default function PhasesSection({ presale }: { presale: PresaleData }) {
    return (
        <div id="phases" className="py-5 position-relative" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '60%', height: '100%', background: 'radial-gradient(ellipse at center, rgba(13, 202, 240, 0.05) 0%, transparent 70%)', pointerEvents: 'none' }}></div>

            <Container className="position-relative z-1">
                <div className="text-center mb-5">
                    <h2 className="display-5 fw-bold mb-3" style={styles.gradientText}>Price Schedule</h2>
                    <p className="text-secondary lead">Secure your position before the next price increase.</p>
                </div>

                <Row className="g-4 justify-content-center align-items-center">
                    {[1, 2, 3, 4, 5].map((id) => {
                        const isCurrent = presale.currentPhase === id;
                        const isPassed = presale.currentPhase > id;

                        let cardStyle = isCurrent ? styles.activeGlass : styles.glass;
                        let textColor = isCurrent ? 'text-white' : (isPassed ? 'text-secondary' : 'text-white-50');

                        return (
                            <Col key={id} xs={6} md={4} lg={2}>
                                <div
                                    className="p-4 rounded-4 text-center h-100 d-flex flex-column justify-content-center position-relative"
                                    style={{ ...cardStyle, opacity: isPassed ? 0.6 : 1, cursor: 'default' }}
                                >
                                    <div className="mb-3">
                                        {isPassed ? (
                                            <Badge bg="success" className="bg-opacity-25 text-success border border-success border-opacity-25 px-2 py-1">SOLD OUT</Badge>
                                        ) : isCurrent ? (
                                            <Badge bg="info" className="text-black shadow-sm px-3 py-1">LIVE NOW</Badge>
                                        ) : (
                                            <Badge bg="dark" className="text-secondary border border-secondary border-opacity-25 px-2 py-1">UPCOMING</Badge>
                                        )}
                                    </div>

                                    <div className={`small fw-bold letter-spacing-1 mb-1 ${isCurrent ? 'text-info' : 'text-secondary'}`}>
                                        PHASE {id}
                                    </div>

                                    <h3 className={`fw-bold mb-0 ${textColor}`}>${id}.00</h3>

                                    {isPassed && (
                                        <div className="position-absolute top-50 start-50 translate-middle w-100" style={{ pointerEvents: 'none' }}>
                                            <div style={{ height: '1px', background: 'rgba(25, 135, 84, 0.5)', transform: 'rotate(-15deg)' }}></div>
                                        </div>
                                    )}
                                </div>
                            </Col>
                        );
                    })}
                </Row>
            </Container>
        </div>
    );
}