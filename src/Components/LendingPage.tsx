import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Navbar, Nav, Button, Card, Row, Col, ProgressBar, Form, Badge, Dropdown, Spinner } from 'react-bootstrap';
import { usePresale } from '../hooks/usePresale';
import TokenomicsSection from './Tokonomics';
import PhasesSection from './Phases';

const Icons = {
    Wallet: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a2 2 0 0 1-2-2V7ad2 2 0 0 1 2-2h3M16 14h.01" /></svg>,
    ArrowDown: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>,
    Globe: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>,
    Power: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18.36 6.64a9 9 0 1 1-12.73 0" /><line x1="12" y1="2" x2="12" y2="12" /></svg>
};

const LOGO_URL = "./dmx.png";
const USDT_LOGO = "https://cryptologos.cc/logos/tether-usdt-logo.png";
const BG_IMAGE_URL = "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=2552";

export default function LendingPage() {
    const presale = usePresale();
    const [mode, setMode] = useState('BUY'); // 'BUY' | 'SELL'
    const [amount, setAmount] = useState("");
    const [referrer, setReferrer] = useState("");
    const [output, setOutput] = useState("");

    useEffect(() => {
        if (!amount) { setOutput(""); return; }
        const price = parseFloat(presale.currentPrice) || 1;
        const val = parseFloat(amount);
        if (mode === 'BUY') {
            setOutput((val / price).toFixed(4));
        } else {
            setOutput((val * price * 0.85).toFixed(4));
        }
    }, [amount, mode, presale.currentPrice]);

    const handleAction = () => {
        if (mode === 'BUY') presale.buyTokens(amount, referrer);
        else presale.sellTokens(amount);
    };
    const onAmountChange = (value: string) => {
        // Allow empty (so user can delete)
        if (value === '') {
            setAmount('');
            return;
        }

        // Regex: only positive numbers with optional decimal
        const valid = /^\d*\.?\d*$/.test(value);

        if (!valid) return;

        setAmount(value);
    };

    const progress = (parseFloat(presale.phaseSold) / parseFloat(presale.phaseCap)) * 100 || 0;
    const balance = mode === 'BUY' ? parseFloat(presale.usdtBalance).toFixed(2) : parseFloat(presale.dmxBalance).toFixed(2);

    return (
        <div className="min-vh-100 bg-black text-white position-relative overflow-hidden font-sans-serif">

            <img
                src={BG_IMAGE_URL}
                alt="Background"
                className="position-fixed top-0 start-0 w-100 h-100 object-fit-cover opacity-25 z-0"
            />

            <div className="position-relative z-1">
                <Navbar expand="lg" variant="dark" className="py-3 bg-dark bg-opacity-75 border-bottom border-secondary border-opacity-25 sticky-top backdrop-blur">
                    <Container>
                        <Navbar.Brand className="d-flex align-items-center gap-2 fw-bold fs-4">
                            <img src={LOGO_URL} alt="Dominix" width="40" height="40" className="object-fit-contain" />
                            <span className="text-info tracking-wider">DOMINIX</span>
                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="mx-auto">
                                <Nav.Link href="#" className="text-white mx-3 fw-semibold">Swap</Nav.Link>
                                <Nav.Link href="#phases" className="text-white-50 mx-3">Phases</Nav.Link>
                                <Nav.Link href="#tokenomics" className="text-white-50 mx-3">Tokenomics</Nav.Link>
                            </Nav>

                            {!presale.account ? (
                                <Button
                                    variant="dark"
                                    onClick={presale.connectWallet}
                                    disabled={presale.connecting}
                                    className="d-flex align-items-center gap-2 rounded-pill px-4 border border-secondary bg-white bg-opacity-10"
                                >
                                    {presale.connecting ? (
                                        <>
                                            <Spinner animation="border" size="sm" /> Connecting...
                                        </>
                                    ) : (
                                        <>
                                            <Icons.Wallet /> Connect Wallet
                                        </>
                                    )}
                                </Button>
                            ) : (
                                <Dropdown>
                                    <Dropdown.Toggle
                                        variant="dark"
                                        className="d-flex align-items-center gap-2 rounded-pill px-3 py-2 border border-info border-opacity-25 bg-info bg-opacity-10 text-white"
                                    >
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="bg-success rounded-circle" style={{ width: 8, height: 8 }}></div>
                                            <span className="small fw-bold text-info">BSC Testnet</span>
                                        </div>
                                        <div className="vr mx-2 bg-secondary"></div>
                                        <span className="small fw-bold">{presale.account.substring(0, 6)}...{presale.account.substring(38)}</span>
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu align="end" className="shadow-lg rounded-4 p-3 bg-dark border border-secondary border-opacity-25" style={{ minWidth: '240px' }}>
                                        <div className="d-flex align-items-center gap-2 mb-3 px-2">
                                            <Icons.Globe />
                                            <span className="small text-white-50">Connected to BNB Testnet</span>
                                        </div>
                                        <div className="bg-black bg-opacity-50 rounded-3 p-2 mb-3">
                                            <div className="d-flex justify-content-between text-secondary small mb-1">
                                                <span>BNB Balance</span>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                <span className="fw-bold text-white">{parseFloat(presale.bnbBalance).toFixed(4)} BNB</span>
                                            </div>
                                        </div>
                                        <Dropdown.Item onClick={presale.disconnectWallet} className="text-danger rounded-3 d-flex align-items-center gap-2 hover-bg-secondary">
                                            <Icons.Power /> Disconnect
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            )}
                        </Navbar.Collapse>
                    </Container>
                </Navbar>

                <Container className="py-5">
                    <Row className="justify-content-center align-items-start min-vh-75 py-lg-5">
                        <Col lg={6} className="text-center text-lg-start mb-5 mb-lg-0 pt-lg-5">
                            <Badge bg="dark" className="border border-info text-info px-3 py-2 rounded-pill mb-3">
                                ● Presale Phase {presale.currentPhase} Live
                            </Badge>

                            <h1 className="display-4 fw-bold mb-3 lh-1">
                                Secure Your <br />
                                <span className="text-info">Early Allocation</span>
                            </h1>
                            <p className=" text-secondary mb-4">
                                Don't wait for the public listing at $10.00. Buy DMX now at the lowest possible entry price before the next phase increase.
                            </p>

                            <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start">
                                <div className="p-3 px-4 rounded-4 bg-white bg-opacity-10 border border-white border-opacity-10 text-center text-lg-start">
                                    <small className="d-block text-white-50 text-uppercase fw-bold mb-1" style={{ fontSize: '0.7rem' }}>
                                        Current Price
                                    </small>
                                    <div className="d-flex align-items-center justify-content-center justify-content-lg-start gap-2">
                                        <span className="h3 fw-bold text-white mb-0">
                                            ${parseFloat(presale.currentPrice).toFixed(2)}
                                        </span>
                                        <span className="badge bg-info text-dark rounded-pill border border-info">
                                            LIVE
                                        </span>
                                    </div>
                                </div>

                                {/* Listing Price Block */}
                                <div className="p-3 px-4 rounded-4 bg-success bg-opacity-10 border border-success border-opacity-25 text-center text-lg-start">
                                    <small className="d-block text-success text-uppercase fw-bold mb-1" style={{ fontSize: '0.7rem' }}>
                                        Listing Target
                                    </small>
                                    <div className="d-flex align-items-center justify-content-center justify-content-lg-start gap-2">
                                        <span className="h3 fw-bold text-white mb-0">
                                            $10.00
                                        </span>
                                        <span className="text-success fw-bold fs-5 lh-1">
                                            ↗
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 p-3 rounded-4 bg-black bg-opacity-25 border border-secondary">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="text-white small fw-bold text-uppercase">
                                        <span className="text-info me-2">●</span>
                                        Phase {presale.currentPhase}
                                    </span>
                                    <span className="badge bg-dark text-secondary fw-normal border border-secondary border-opacity-25">
                                        {parseFloat(presale.phaseSold).toFixed(0)} / {parseFloat(presale.phaseCap).toFixed(0)}
                                    </span>
                                </div>

                                <ProgressBar
                                    now={progress}
                                    variant="info"
                                    animated
                                    striped
                                    className="rounded-pill bg-white bg-opacity-10"
                                />

                                <div className="d-flex justify-content-end mt-1">
                                    <small className="text-info fw-bold" style={{ fontSize: '0.75rem' }}>
                                        {progress.toFixed(2)}% Complete
                                    </small>
                                </div>
                            </div>
                        </Col>

                        <Col lg={5} xl={5}>
                            <Card className="rounded-5 text-white shadow-lg border border-white border-opacity-10 bg-dark bg-opacity-75">
                                <Card.Body className="p-3">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="fw-bold mb-0">Buy DMX</h5>
                                    </div>

                                    <div className="d-flex bg-black bg-opacity-50 p-1 rounded-pill mb-3 border border-secondary border-opacity-25">
                                        <div
                                            onClick={() => setMode('BUY')}
                                            className={`flex-fill text-center py-1 rounded-pill fw-bold small ${mode === 'BUY' ? 'bg-dark text-info shadow' : 'text-secondary'}`}
                                            role="button"
                                        >
                                            Buy
                                        </div>
                                        <div
                                            onClick={() => setMode('SELL')}
                                            className={`flex-fill text-center py-1 rounded-pill fw-bold small ${mode === 'SELL' ? 'bg-dark text-warning shadow' : 'text-secondary'}`}
                                            role="button"
                                        >
                                            Sell
                                        </div>
                                    </div>

                                    <div className="p-3 mb-1 bg-black bg-opacity-25 rounded-4 border border-white border-opacity-10">
                                        <div className="d-flex justify-content-between mb-1">
                                            <span className="text-secondary small fw-semibold" style={{ fontSize: '0.75rem' }}>You pay</span>
                                            <span className="text-secondary small" style={{ fontSize: '0.75rem' }}>Bal: {balance}</span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                placeholder="0"
                                                value={amount}
                                                onChange={(e) => onAmountChange(e.target.value)}
                                                className="bg-transparent border-0 text-white fw-bold fs-4 w-75 p-0 shadow-none form-control-plaintext"
                                            />

                                            <Badge bg="dark" className="d-flex align-items-center gap-2 px-2 py-1 rounded-pill border border-secondary border-opacity-25 text-white" style={{ fontSize: '0.8rem' }}>
                                                <img src={mode === 'BUY' ? USDT_LOGO : LOGO_URL} width="16" alt="Icon" />
                                                {mode === 'BUY' ? 'USDT' : 'DMX'}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="position-relative text-center my-2">
                                        <div className="position-absolute top-50 start-50 translate-middle bg-dark p-1 rounded-3 border border-secondary border-opacity-25 z-1">
                                            <div className="bg-secondary bg-opacity-25 rounded-2 p-1 text-white">
                                                <Icons.ArrowDown />
                                            </div>
                                        </div>
                                        <hr className="border-secondary border-opacity-25" />
                                    </div>

                                    <div className="p-3 mt-1 mb-3 bg-black bg-opacity-25 rounded-4 border border-white border-opacity-10">
                                        <div className="d-flex justify-content-between mb-1">
                                            <span className="text-secondary small fw-semibold" style={{ fontSize: '0.75rem' }}>You receive</span>
                                            {mode === 'SELL' && <span className="text-warning small" style={{ fontSize: '0.7rem' }}>15% Tax</span>}
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <input
                                                type="text"
                                                placeholder="0.00"
                                                value={output}
                                                readOnly
                                                className="bg-transparent border-0 text-white-50 fw-bold fs-4 w-75 p-0 shadow-none form-control-plaintext"
                                            />
                                            <Badge bg="dark" className="d-flex align-items-center gap-2 px-2 py-1 rounded-pill border border-secondary border-opacity-25 text-white" style={{ fontSize: '0.8rem' }}>
                                                <img src={mode === 'BUY' ? LOGO_URL : USDT_LOGO} width="16" alt="Icon" />
                                                {mode === 'BUY' ? 'DMX' : 'USDT'}
                                            </Badge>
                                        </div>
                                    </div>

                                    {mode === 'BUY' && (
                                        <div className="mb-4">
                                            <div className="d-flex align-items-center gap-1 text-secondary small mb-2">
                                                <span>Referral Code (Optional)</span>
                                            </div>
                                            <Form.Control
                                                type="text"
                                                placeholder="0x..."
                                                value={referrer}
                                                onChange={(e) => setReferrer(e.target.value)}
                                                className="bg-black bg-opacity-25 border-secondary border-opacity-25 text-white rounded-3 shadow-none"
                                            />
                                        </div>
                                    )}
                                    <Button
                                        variant={mode === 'BUY' ? 'info' : 'warning'}
                                        size="lg"
                                        disabled={presale.loading || !presale.account}
                                        className={`w-100 fw-bold py-2 rounded-4 shadow-lg text-white border-0 ${mode === 'BUY' ? 'bg-gradient-info' : ''}`}
                                        onClick={handleAction}
                                    >
                                        {presale.loading ? (
                                            <>
                                                <Spinner animation="border" size="sm" /> Processing...
                                            </>
                                        ) : (
                                            presale.account ? (mode === 'BUY' ? 'Buy Now' : 'Sell Back') : 'Connect Wallet First'
                                        )}
                                    </Button>
                                </Card.Body>
                            </Card>


                        </Col>
                    </Row>
                </Container>

                <PhasesSection presale={presale} />

                <TokenomicsSection />

                <footer className="text-center py-4 text-white-50 small border-top border-secondary border-opacity-10 bg-black">
                    <Container>© 2025 Dominix Protocol. All rights reserved.</Container>
                </footer>
            </div>
        </div>
    );
}