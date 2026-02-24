// @ts-check
/**
 * DevHub IT - Turso Database Seed Script
 * Run with: npx tsx scripts/seed.ts
 */

import { createClient } from '@libsql/client';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(__dirname, '..', '.env.local') });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function seed() {
  console.log('🔄 Creating tables...');

  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      location TEXT NOT NULL,
      type TEXT NOT NULL,
      salary_min INTEGER,
      salary_max INTEGER,
      level TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      requirements TEXT,
      benefits TEXT,
      posted_date TEXT,
      logo_color TEXT
    );

    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      level TEXT NOT NULL,
      duration TEXT,
      modules TEXT,
      badge_name TEXT,
      badge_description TEXT,
      badge_color TEXT,
      company_tips TEXT,
      prerequisites TEXT
    );

    CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      questions TEXT NOT NULL,
      passing_score INTEGER DEFAULT 70,
      FOREIGN KEY (course_id) REFERENCES courses(id)
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      avatar_color TEXT,
      title TEXT,
      bio TEXT,
      joined_date TEXT
    );

    CREATE TABLE IF NOT EXISTS user_badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      badge_name TEXT NOT NULL,
      earned_date TEXT,
      score INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (course_id) REFERENCES courses(id)
    );

    CREATE TABLE IF NOT EXISTS user_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      completed_modules TEXT DEFAULT '[]',
      quiz_score INTEGER DEFAULT 0,
      quiz_completed INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (course_id) REFERENCES courses(id)
    );
  `);

  console.log('✅ Tables created');

  // Check if data already exists
  const existingJobs = await db.execute('SELECT COUNT(*) as count FROM jobs');
  if (Number(existingJobs.rows[0].count) > 0) {
    console.log('⚠️  Database already has data, clearing...');
    await db.executeMultiple(`
      DELETE FROM user_progress;
      DELETE FROM user_badges;
      DELETE FROM quizzes;
      DELETE FROM courses;
      DELETE FROM jobs;
      DELETE FROM users;
    `);
  }

  // ========== SEED USERS ==========
  console.log('🔄 Seeding users...');
  await db.execute({
    sql: `INSERT INTO users (name, email, avatar_color, title, bio, joined_date) VALUES
      (?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?)`,
    args: [
      'Marco Rossi', 'marco.rossi@devhub.it', '#6366f1', 'Full-Stack Developer', 'Appassionato di tecnologia e sviluppo software. Sempre alla ricerca di nuove sfide nel mondo IT.', '2025-01-15',
      'Laura Bianchi', 'laura.bianchi@devhub.it', '#ec4899', 'DevOps Engineer', 'Cloud architect con esperienza in AWS e Azure. Amo automatizzare tutto.', '2025-02-01',
      'Alessandro Verdi', 'alessandro.verdi@devhub.it', '#10b981', 'Data Scientist', 'Machine Learning enthusiast. Python lover. Kaggle competitor.', '2025-03-10',
    ],
  });
  console.log('✅ Users seeded');

  // ========== SEED JOBS ==========
  console.log('🔄 Seeding jobs...');

  const jobs = [
    ['Senior Frontend Developer', 'TechVision S.r.l.', 'Milano', 'hybrid', 45000, 65000, 'senior', 'frontend',
      'Cerchiamo un Senior Frontend Developer per guidare lo sviluppo della nostra piattaforma SaaS enterprise. Lavorerai con React 18+, TypeScript e un design system proprietario. Il team è composto da 8 sviluppatori e utilizziamo metodologie Agile/Scrum.',
      JSON.stringify(["React 18+ con Hooks avanzati e Context API","TypeScript 5+ con generics e utility types","Next.js 14 (App Router, Server Components)","Testing con Jest, React Testing Library, Cypress","CI/CD con GitHub Actions","Esperienza con design system (Storybook)","Almeno 5 anni di esperienza frontend"]),
      JSON.stringify(["Smart working 3 giorni/settimana","Budget formazione 2000€/anno","MacBook Pro M3","Assicurazione sanitaria integrativa","Buoni pasto 8€/giorno"]),
      '2026-02-20', '#6366f1'],
    ['Backend Developer Java', 'FinTech Solutions', 'Roma', 'hybrid', 40000, 58000, 'mid', 'backend',
      'Entra nel nostro team di sviluppo backend per costruire microservizi ad alta affidabilità nel settore fintech. Stack tecnologico: Java 21, Spring Boot 3, PostgreSQL, Kafka, Docker.',
      JSON.stringify(["Java 17+ (preferibilmente 21)","Spring Boot 3.x, Spring Security, Spring Data","PostgreSQL e Redis","Apache Kafka per event-driven architecture","Docker e Kubernetes","RESTful API design e OpenAPI/Swagger","3-5 anni di esperienza backend"]),
      JSON.stringify(["RAL competitiva + bonus annuale","Hybrid working (2 giorni in ufficio)","Conferenze tech pagate","Piano di crescita professionale","Stock options dopo 1 anno"]),
      '2026-02-18', '#f59e0b'],
    ['DevOps Engineer', 'CloudNative S.p.A.', 'Torino', 'remote', 50000, 72000, 'senior', 'devops',
      'Stiamo cercando un DevOps Engineer esperto per gestire la nostra infrastruttura cloud multi-region su AWS. Gestirai pipeline CI/CD, monitoring, e Infrastructure as Code per oltre 50 microservizi.',
      JSON.stringify(["AWS (EC2, ECS, Lambda, RDS, S3, CloudFront)","Terraform e/o Pulumi per IaC","Kubernetes (EKS) e Helm charts","GitHub Actions e ArgoCD","Prometheus, Grafana, ELK Stack","Linux administration avanzata","Scripting Bash/Python","5+ anni in ruoli DevOps/SRE"]),
      JSON.stringify(["Full remote con meetup trimestrali","RAL fino a 72K","Budget hardware 3000€","30 giorni di ferie","Orario flessibile"]),
      '2026-02-22', '#10b981'],
    ['Junior Full-Stack Developer', 'StartupHub', 'Milano', 'onsite', 25000, 32000, 'junior', 'fullstack',
      'Opportunità perfetta per chi vuole crescere rapidamente in una startup innovativa. Lavorerai su progetti greenfield con tecnologie moderne. Mentoring garantito da sviluppatori senior.',
      JSON.stringify(["JavaScript/TypeScript fondamentali","React o Vue.js (base)","Node.js con Express o Fastify","SQL (PostgreSQL o MySQL)","Git e GitHub flow","Laurea in informatica o equivalente","0-2 anni di esperienza"]),
      JSON.stringify(["Percorso di crescita accelerato","Mentoring 1:1 settimanale","Pranzo in ufficio gratuito","Team giovane e dinamico","Possibilità di equity"]),
      '2026-02-23', '#8b5cf6'],
    ['Data Engineer', 'DataFlow Analytics', 'Bologna', 'hybrid', 42000, 60000, 'mid', 'data',
      'Cerchiamo un Data Engineer per progettare e mantenere pipeline dati scalabili. Lavorerai con big data, ETL processes e data warehouse moderni per clienti enterprise.',
      JSON.stringify(["Python 3.10+ con focus su data engineering","Apache Spark e/o Apache Flink","SQL avanzato e data modeling","AWS (Redshift, Glue, S3) o GCP (BigQuery)","Airflow per orchestrazione","dbt per data transformation","3-4 anni di esperienza con dati"]),
      JSON.stringify(["Hybrid 2/3 giorni remoto","Budget conferenze illimitato","Certificazioni cloud pagate","Welfare aziendale 1500€","Ambiente internazionale"]),
      '2026-02-19', '#f43f5e'],
    ['Cybersecurity Analyst', 'SecureIT Group', 'Roma', 'hybrid', 38000, 55000, 'mid', 'security',
      'Unisciti al nostro SOC team come Security Analyst. Monitorerai le minacce, condurrai vulnerability assessment e gestirai incident response per clienti enterprise mission-critical.',
      JSON.stringify(["SIEM (Splunk, QRadar o Sentinel)","Vulnerability scanning (Nessus, Qualys)","Network security e firewall management","Incident response e digital forensics","Conoscenza framework NIST/ISO 27001","CEH, CompTIA Security+ o equivalenti","2-4 anni in cybersecurity"]),
      JSON.stringify(["Certificazioni pagate (OSCP, CISSP)","Laboratorio cyber dedicato","Smart working 60%","Assicurazione sanitaria premium","Reperibilità retribuita extra"]),
      '2026-02-21', '#ef4444'],
    ['Mobile Developer (React Native)', 'AppFactory', 'Napoli', 'remote', 35000, 50000, 'mid', 'mobile',
      'Sviluppa app mobile cross-platform per clienti di primo livello. Il nostro team mobile gestisce 12 app in produzione con milioni di utenti attivi.',
      JSON.stringify(["React Native 0.73+ con New Architecture","TypeScript strict mode","State management (Redux Toolkit, Zustand)","Testing con Detox e Jest","CI/CD mobile (Fastlane, App Center)","Pubblicazione App Store e Play Store","3+ anni React Native"]),
      JSON.stringify(["Full remote Italia/EU","Dispositivi di test forniti","Budget formazione 1500€","Venerdì pomeriggio libero","Team retreat annuale"]),
      '2026-02-17', '#06b6d4'],
    ['Cloud Architect', 'Enterprise Cloud', 'Milano', 'hybrid', 60000, 85000, 'lead', 'cloud',
      'Ruolo di Cloud Architect per guidare la migrazione cloud di grandi aziende italiane. Progetterai architetture multi-cloud, definirai best practices e menterai il team di 15 cloud engineers.',
      JSON.stringify(["AWS Solutions Architect Professional o equivalente","Multi-cloud (AWS + Azure o GCP)","Architetture serverless e container-based","Security compliance (GDPR, SOC2)","Cost optimization e FinOps","Terraform/CloudFormation avanzato","Leadership tecnica e mentoring","8+ anni di esperienza, 3+ in cloud"]),
      JSON.stringify(["RAL fino a 85K + MBO","Auto aziendale","Executive health check","Remote working flessibile","Budget team building"]),
      '2026-02-24', '#0ea5e9'],
    ['ML Engineer', 'AI Factory', 'Torino', 'hybrid', 48000, 68000, 'senior', 'data',
      'Cerchiamo un ML Engineer per sviluppare e deployare modelli di machine learning in produzione. Lavorerai su NLP, computer vision e recommendation systems per il settore automotive.',
      JSON.stringify(["Python con PyTorch e/o TensorFlow","MLOps (MLflow, Kubeflow, Weights & Biases)","NLP (Transformers, BERT, GPT fine-tuning)","Computer Vision (YOLO, ResNet)","Cloud ML services (SageMaker, Vertex AI)","Docker, Kubernetes per ML serving","PhD o 5+ anni ML in produzione"]),
      JSON.stringify(["Accesso GPU cluster dedicato","Pubblicazioni scientifiche supportate","Hybrid working","Budget conferenze AI/ML","Collaborazione con università"]),
      '2026-02-16', '#a855f7'],
    ['Junior Backend Developer (Python)', 'WebAgency Pro', 'Firenze', 'onsite', 24000, 30000, 'junior', 'backend',
      'Cerchiamo un giovane talento appassionato di Python per il nostro team backend. Svilupperai API REST, integrerai servizi terzi e lavorerai su progetti web innovativi.',
      JSON.stringify(["Python 3.10+ fondamentali","Django o FastAPI base","SQL (PostgreSQL)","Git basics","API REST concepts","Voglia di imparare","Laurea triennale in informatica o autodidatta motivato"]),
      JSON.stringify(["Mentoring da senior developer","Corsi Udemy/Pluralsight gratuiti","Ufficio in centro storico","Orario flessibile","Crescita rapida garantita"]),
      '2026-02-15', '#84cc16'],
    ['Site Reliability Engineer', 'ScaleUp Infra', 'Milano', 'remote', 55000, 78000, 'senior', 'devops',
      "SRE role per garantire l'affidabilità di sistemi che servono 10M+ requests/day. Definirai SLOs, gestirai incident management e automatizzerai le operazioni.",
      JSON.stringify(["Kubernetes a scala (500+ pods)","Observability (OpenTelemetry, Datadog)","Programming Go o Python","Chaos Engineering (Litmus, Gremlin)","Database administration (PostgreSQL, MongoDB)","On-call management e incident response","SLA/SLO/SLI definition","5+ anni in SRE/DevOps"]),
      JSON.stringify(["Full remote EU","On-call retribuita 500€/settimana","RSU (stock units)","Sabbatical dopo 3 anni","Top tier hardware"]),
      '2026-02-14', '#14b8a6'],
    ['UX/UI Designer Developer', 'DesignTech', 'Bologna', 'hybrid', 35000, 48000, 'mid', 'frontend',
      'Cerchiamo un profilo ibrido design/development per creare esperienze utente straordinarie. Progetterai e implementerai interfacce accessibili e performanti.',
      JSON.stringify(["Figma avanzato (Auto Layout, Variables, Components)","HTML/CSS/JavaScript eccellenti","React con Tailwind CSS","Design System creation","Accessibilità WCAG 2.1 AA","User Research e Design Thinking","Portfolio dimostrabile","3+ anni design + sviluppo"]),
      JSON.stringify(["Licenze software pagate","Corsi design premium","Hybrid 3+2","Hardware Apple fornito","Team design internazionale"]),
      '2026-02-13', '#ec4899'],
    ['Blockchain Developer', 'Web3 Italia', 'Remote', 'remote', 50000, 75000, 'senior', 'backend',
      'Sviluppa smart contract e DApps per il nostro ecosistema DeFi. Cerchiamo esperti Solidity con passione per la decentralizzazione e le nuove tecnologie Web3.',
      JSON.stringify(["Solidity e Vyper","Hardhat/Foundry per testing","Ethers.js/Web3.js","EVM internals e gas optimization","DeFi protocols (Uniswap, Aave, Compound)","Audit di sicurezza smart contract","3+ anni blockchain development"]),
      JSON.stringify(["Compensation parziale in token","Full remote globale","Hackathon trimestrali","Governance partecipata","Accesso conferenze Web3"]),
      '2026-02-12', '#f97316'],
    ['QA Automation Engineer', 'QualityFirst', 'Padova', 'hybrid', 33000, 47000, 'mid', 'fullstack',
      'Costruisci framework di test automatizzati end-to-end per le nostre applicazioni enterprise. Collaborerai con team di sviluppo per garantire qualità e velocità di rilascio.',
      JSON.stringify(["Cypress e/o Playwright","Selenium WebDriver","API testing (Postman, RestAssured)","Performance testing (JMeter, k6)","CI/CD integration","BDD con Cucumber","JavaScript/TypeScript o Java","3+ anni QA automation"]),
      JSON.stringify(["Smartworking 3gg/settimana","Certificazione ISTQB pagata","Budget formazione","Buoni pasto elettronici","Assicurazione sanitaria"]),
      '2026-02-11', '#64748b'],
    ['System Administrator Linux', 'InfraCore', 'Genova', 'onsite', 30000, 42000, 'mid', 'cloud',
      "Gestisci l'infrastruttura on-premise e cloud ibrida dei nostri data center. Amministrerai server Linux, storage, networking e servizi di virtualizzazione.",
      JSON.stringify(["Linux (RHEL, Ubuntu Server) avanzato","Ansible e/o Puppet per automation","VMware vSphere/KVM","Storage (SAN, NAS, Ceph)","Networking (TCP/IP, VPN, firewall)","Bash scripting avanzato","LPIC-2 o RHCSA/RHCE preferiti","3+ anni sysadmin"]),
      JSON.stringify(["Reperibilità retribuita","Certificazioni Red Hat pagate","Ambiente stabile","Mensa aziendale","Orario 9-18 flessibile"]),
      '2026-02-10', '#78716c'],
  ];

  for (const job of jobs) {
    await db.execute({
      sql: 'INSERT INTO jobs (title, company, location, type, salary_min, salary_max, level, category, description, requirements, benefits, posted_date, logo_color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: job,
    });
  }
  console.log(`✅ ${jobs.length} jobs seeded`);

  // ========== SEED COURSES ==========
  console.log('🔄 Seeding courses...');

  const courses = [
    // Course 1: Networking
    ['Fondamenti di Networking',
      'Corso completo sui fondamenti delle reti informatiche. Dal modello OSI al TCP/IP, dalla subnettazione al routing, fino ai protocolli applicativi. Preparazione ideale per certificazioni Cisco CCNA e CompTIA Network+.',
      'networking', 'intermediate', '40 ore',
      JSON.stringify([
        { title: 'Il Modello OSI e TCP/IP', description: 'Comprensione approfondita dei layer di rete', content: "## Il Modello OSI\n\nIl modello OSI (Open Systems Interconnection) è un framework concettuale a 7 livelli che standardizza le funzioni di un sistema di comunicazione.\n\n### I 7 Livelli\n\n**Layer 7 - Applicazione**: Interfaccia diretta con l'utente. Protocolli: HTTP/HTTPS, FTP, SMTP, DNS, DHCP.\n\n**Layer 6 - Presentazione**: Traduzione, crittografia e compressione dei dati. Formati: SSL/TLS, JPEG, ASCII, MPEG.\n\n**Layer 5 - Sessione**: Gestione delle sessioni di comunicazione. Protocolli: NetBIOS, RPC, PPTP.\n\n**Layer 4 - Trasporto**: Consegna affidabile end-to-end. TCP (connection-oriented, three-way handshake: SYN, SYN-ACK, ACK) e UDP (connectionless, bassa latenza).\n\n**Layer 3 - Rete**: Routing e indirizzamento logico. IP, ICMP, OSPF, BGP. Gestisce l'instradamento dei pacchetti.\n\n**Layer 2 - Data Link**: Framing e indirizzamento fisico (MAC). Ethernet, Wi-Fi (802.11), ARP, switch.\n\n**Layer 1 - Fisico**: Trasmissione bit sul mezzo fisico. Cavi, connettori, hub, segnali elettrici/ottici.\n\n### TCP/IP Model\nIl modello TCP/IP semplifica a 4 livelli:\n1. **Network Access** (L1+L2 OSI)\n2. **Internet** (L3 OSI) - IP, ICMP, ARP\n3. **Transport** (L4 OSI) - TCP, UDP\n4. **Application** (L5+L6+L7 OSI)\n\n### Encapsulation\nOgni layer aggiunge il proprio header:\n- Application → **Data**\n- Transport → **Segment** (TCP) / **Datagram** (UDP)\n- Network → **Packet**\n- Data Link → **Frame**\n- Physical → **Bits**" },
        { title: 'Indirizzamento IP e Subnetting', description: 'IPv4, IPv6, CIDR e calcolo delle subnet', content: "## Indirizzamento IPv4\n\nUn indirizzo IPv4 è composto da 32 bit, divisi in 4 ottetti (es. 192.168.1.1).\n\n### Classi di Indirizzi\n- **Classe A**: 1.0.0.0 - 126.255.255.255 (/8, 16M host)\n- **Classe B**: 128.0.0.0 - 191.255.255.255 (/16, 65K host)\n- **Classe C**: 192.0.0.0 - 223.255.255.255 (/24, 254 host)\n\n### Indirizzi Privati (RFC 1918)\n- 10.0.0.0/8\n- 172.16.0.0/12\n- 192.168.0.0/16\n\n### CIDR e Subnetting\nIl CIDR (Classless Inter-Domain Routing) permette subnet di dimensioni variabili.\n\n**Esempio di subnetting**: Data la rete 192.168.10.0/24, suddividerla in 4 subnet:\n- Servono 2 bit extra per 4 subnet → /26 (26 = 24 + 2)\n- Ogni subnet ha 2^6 - 2 = 62 host utilizzabili\n- Subnet 1: 192.168.10.0/26 (host: .1 - .62, broadcast: .63)\n- Subnet 2: 192.168.10.64/26 (host: .65 - .126, broadcast: .127)\n- Subnet 3: 192.168.10.128/26 (host: .129 - .190, broadcast: .191)\n- Subnet 4: 192.168.10.192/26 (host: .193 - .254, broadcast: .255)\n\n### IPv6\n128 bit, notazione esadecimale (es. 2001:0db8:85a3::8a2e:0370:7334)\n- Link-local: fe80::/10\n- Global Unicast: 2000::/3\n- Loopback: ::1" },
        { title: 'Routing e Switching', description: 'Protocolli di routing, VLAN e switching avanzato', content: "## Switching Layer 2\n\n### Come funziona uno Switch\nUno switch mantiene una **MAC Address Table** che associa indirizzi MAC alle porte fisiche.\n- **Learning**: Impara i MAC dagli indirizzi sorgente dei frame\n- **Forwarding**: Invia il frame solo alla porta corretta\n- **Flooding**: Se il MAC destinazione è sconosciuto, invia su tutte le porte\n\n### VLAN (Virtual LAN)\nPermettono la segmentazione logica della rete:\n- **Access Port**: appartiene a una sola VLAN\n- **Trunk Port**: trasporta traffico di più VLAN (802.1Q tagging)\n- **Native VLAN**: VLAN senza tag sul trunk\n\n## Routing Layer 3\n\n### Static Routing\nRoute configurate manualmente. Ideale per reti piccole.\n```\nip route 10.0.2.0 255.255.255.0 192.168.1.1\n```\n\n### Dynamic Routing Protocols\n\n**RIP (Routing Information Protocol)**\n- Distance vector, max 15 hop\n- Convergenza lenta, uso limitato\n\n**OSPF (Open Shortest Path First)**\n- Link-state, algoritmo Dijkstra\n- Aree gerarchiche, convergenza rapida\n- Standard enterprise\n\n**BGP (Border Gateway Protocol)**\n- Path vector, routing inter-AS\n- Backbone di Internet\n- Policy-based routing\n\n### Default Gateway\nRouter di ultima istanza per traffico verso reti esterne." },
        { title: 'DNS, DHCP e Servizi di Rete', description: 'Protocolli applicativi fondamentali', content: "## DNS (Domain Name System)\n\n### Gerarchia DNS\n1. **Root servers** (13 cluster globali)\n2. **TLD servers** (.com, .it, .org)\n3. **Authoritative servers** (gestiscono i record del dominio)\n4. **Recursive resolvers** (resolver locali/ISP)\n\n### Tipi di Record\n- **A**: Nome → IPv4\n- **AAAA**: Nome → IPv6\n- **CNAME**: Alias\n- **MX**: Mail server\n- **NS**: Nameserver autoritativi\n- **TXT**: Testo arbitrario (SPF, DKIM)\n- **SOA**: Start of Authority\n- **PTR**: Reverse DNS\n\n## DHCP\n\n### Processo DORA\n1. **Discover**: Client broadcast\n2. **Offer**: Server propone un IP\n3. **Request**: Client accetta l'offerta\n4. **Acknowledge**: Server conferma il lease" },
        { title: 'Sicurezza di Rete Base', description: 'Firewall, ACL e best practices', content: "## Firewall\n\n### Tipi di Firewall\n- **Packet Filter**: Filtra per IP/porta (Layer 3-4)\n- **Stateful Inspection**: Traccia le connessioni attive\n- **Application Layer**: Ispezione profonda (Layer 7, WAF)\n- **Next-Generation (NGFW)**: IPS, application awareness\n\n### NAT (Network Address Translation)\n- **SNAT**: Traduce IP sorgente\n- **DNAT/Port Forwarding**: Traduce IP destinazione\n- **PAT**: NAT overload\n\n### VPN\n- **IPSec**: Tunnel mode vs Transport mode\n- **SSL/TLS VPN**: OpenVPN, WireGuard\n\n### Best Practices\n1. Principio del minimo privilegio\n2. Defense in depth\n3. Segmentazione di rete\n4. Monitoring e logging centralizzato" }
      ]),
      'Network Specialist', 'Certificazione di competenza nelle reti informatiche',
      '#3b82f6',
      JSON.stringify(['Le aziende cercano candidati con conoscenza pratica di subnetting e VLAN configuration','La certificazione CCNA è tra le più richieste: aumenta il salario medio del 15%','Competenze di troubleshooting di rete sono essenziali per ruoli NOC e system admin','IPv6 è sempre più richiesto: molte aziende stanno migrando le loro infrastrutture','La conoscenza di Wireshark per analisi del traffico è un forte plus nei colloqui']),
      'Conoscenze base di informatica'],

    // Course 2: Cybersecurity
    ['Cybersecurity Essentials',
      'Corso avanzato sulla sicurezza informatica. Crittografia, threat analysis, penetration testing, incident response e compliance. Preparazione per CompTIA Security+, CEH e percorso verso OSCP.',
      'security', 'advanced', '60 ore',
      JSON.stringify([
        { title: 'Crittografia e PKI', description: 'Algoritmi crittografici e infrastruttura a chiave pubblica', content: "## Crittografia\n\n### Crittografia Simmetrica\n- **AES**: Standard attuale, chiavi 128/192/256 bit\n- **ChaCha20**: Alternativa veloce\n\n### Crittografia Asimmetrica\n- **RSA**: Chiavi ≥2048 bit\n- **ECC**: Chiavi più corte, sicurezza equivalente\n- **Diffie-Hellman**: Scambio chiavi\n\n### Hashing\n- **SHA-256/SHA-3**: Standard sicuri\n- **bcrypt/Argon2**: Per password\n\n### PKI\n- Certificate Authority (CA)\n- Certificate chain\n- Let's Encrypt" },
        { title: 'Threat Landscape e Vulnerability Analysis', description: 'Minacce, vulnerabilità e vettori di attacco', content: "## OWASP Top 10 (2021)\n1. Broken Access Control\n2. Cryptographic Failures\n3. Injection\n4. Insecure Design\n5. Security Misconfiguration\n6. Vulnerable Components\n7. Authentication Failures\n8. Software/Data Integrity\n9. Logging Failures\n10. SSRF\n\n### Tipi di Malware\n- Ransomware, Trojan, Rootkit, Fileless malware, APT" },
        { title: 'Penetration Testing', description: 'Metodologie e strumenti di ethical hacking', content: "## Fasi\n1. Reconnaissance (passivo e attivo)\n2. Scanning & Enumeration (Nmap, Burp Suite)\n3. Exploitation (Metasploit)\n4. Post-Exploitation\n5. Reporting\n\n### Tools Essenziali\n- Burp Suite, Metasploit, Hashcat, Wireshark, SQLmap, Kali Linux" },
        { title: 'Incident Response e SOC', description: 'Gestione incidenti e Security Operations Center', content: "## Framework NIST SP 800-61\n1. Preparation\n2. Detection & Analysis\n3. Containment\n4. Eradication\n5. Recovery\n6. Lessons Learned\n\n### SIEM: Splunk, Microsoft Sentinel, ELK Stack" },
        { title: 'Compliance e Framework di Sicurezza', description: 'Standard, normative e governance della sicurezza', content: "## Framework\n- ISO/IEC 27001\n- NIST Cybersecurity Framework (Identify, Protect, Detect, Respond, Recover)\n- GDPR: 72 ore notifica breach\n- Zero Trust: Never trust, always verify" }
      ]),
      'Security Analyst', 'Certificazione di competenza in cybersecurity',
      '#ef4444',
      JSON.stringify(['Le aziende fintech e sanitarie pagano premium per esperti di sicurezza con conoscenza GDPR','La certificazione OSCP è la più rispettata nel settore','Esperienza con SIEM (Splunk, Sentinel) è richiesta dal 78% degli annunci SOC analyst','Bug bounty experience è molto apprezzata','Le competenze di incident response sono critiche: il 60% delle aziende ha subito un breach']),
      'Fondamenti di networking e sistemi operativi'],

    // Course 3: Cloud & DevOps
    ['Cloud Computing & DevOps',
      'Padroneggia le tecnologie cloud e le pratiche DevOps moderne. AWS, Docker, Kubernetes, Terraform, CI/CD pipelines e monitoring. Percorso verso AWS Solutions Architect e CKA.',
      'cloud', 'advanced', '55 ore',
      JSON.stringify([
        { title: 'Fondamenti Cloud e AWS Core Services', description: 'Concetti cloud e servizi AWS fondamentali', content: "## Cloud Computing\n\n### Modelli di Servizio\n- IaaS, PaaS, SaaS, FaaS/Serverless\n\n### AWS Core\n- Compute: EC2, Lambda, ECS/EKS\n- Storage: S3, EBS, EFS\n- Database: RDS, DynamoDB\n- Networking: VPC, ALB/NLB, CloudFront, Route 53" },
        { title: 'Docker e Containerizzazione', description: 'Container, immagini, networking e best practices', content: "## Docker\n- Image, Container, Dockerfile, Registry\n- Multi-stage builds\n- Docker Compose\n- Networking: bridge, host, overlay" },
        { title: 'Kubernetes', description: 'Orchestrazione container in produzione', content: "## Kubernetes\n- Control Plane: API Server, etcd, Scheduler\n- Risorse: Pod, Deployment, Service, Ingress\n- Scaling: HPA, VPA, Cluster Autoscaler" },
        { title: 'Infrastructure as Code e CI/CD', description: 'Terraform, GitHub Actions e pipeline automatizzate', content: "## Terraform\n- Workflow: init, plan, apply, destroy\n- State management remoto\n\n## GitHub Actions CI/CD\n- Automated testing, deployment\n- Blue/Green, Canary deployments" },
        { title: 'Monitoring e Observability', description: 'Prometheus, Grafana, logging e alerting', content: "## I tre pilastri\n1. Metrics (Prometheus + Grafana)\n2. Logs (ELK / Loki)\n3. Traces (Jaeger / OpenTelemetry)\n\n### SLI/SLO/SLA" }
      ]),
      'Cloud Engineer', 'Certificazione di competenza in cloud e DevOps',
      '#10b981',
      JSON.stringify(['AWS Solutions Architect è la certificazione cloud più richiesta in Italia','Kubernetes è requisito nel 65% degli annunci DevOps','Terraform è lo strumento IaC dominante','Esperienza con GitOps è il trend emergente più richiesto nel 2026','Le competenze FinOps sono sempre più valorizzate']),
      'Fondamenti di networking e Linux base'],

    // Course 4: Full-Stack Development
    ['Full-Stack Web Development',
      "Diventa un Full-Stack Developer completo. React avanzato, Node.js, API design, database, autenticazione e deployment. Dalle basi all'architettura di applicazioni production-ready.",
      'development', 'intermediate', '50 ore',
      JSON.stringify([
        { title: 'React Avanzato e Patterns', description: 'Hooks custom, performance, state management', content: "## React Avanzato\n- Custom Hooks (useDebounce, useFetch)\n- Performance: React.memo, useMemo, useCallback\n- State Management: Context, Zustand, Redux Toolkit, TanStack Query" },
        { title: 'API Design e Backend Node.js', description: 'REST, GraphQL e backend con Node.js/Express', content: "## API REST Best Practices\n- Nomi plurali, versioning, pagination\n- HTTP status codes corretti\n- Express.js + TypeScript + Zod validation\n\n### Authentication: JWT, OAuth 2.0, bcrypt" },
        { title: 'Database e ORM', description: 'PostgreSQL, MongoDB, Prisma e ottimizzazione query', content: "## PostgreSQL\n- Schema design con relazioni\n- Index per performance (B-tree, GIN, GiST)\n\n### Prisma ORM\n- Query Optimization: EXPLAIN ANALYZE\n- Cursor-based pagination" },
        { title: 'Testing e Qualità del Codice', description: 'Unit test, integration test, e2e, CI/CD', content: "## Piramide dei Test\n1. Unit Tests (70%)\n2. Integration Tests (20%)\n3. E2E Tests (10%)\n\n- Jest + React Testing Library\n- Cypress / Playwright\n- ESLint, Prettier, TypeScript strict" },
        { title: 'Deployment e Architettura', description: 'Next.js deployment, microservizi, performance', content: "## Deployment\n- Vercel, Docker, AWS Amplify\n\n### Architettura Microservizi\n- Comunicazione sincrona (REST, gRPC) e asincrona (Kafka)\n\n### Performance\n- CDN, Caching, Image optimization\n- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1" }
      ]),
      'Full-Stack Developer', 'Certificazione di competenza nello sviluppo full-stack',
      '#8b5cf6',
      JSON.stringify(['React + TypeScript è la combinazione frontend più richiesta in Italia','Conoscere sia SQL che NoSQL è fondamentale','Testing è un differenziatore chiave','Esperienza con Next.js App Router e Server Components è sempre più richiesta','Le aziende valutano molto i progetti open source']),
      'HTML, CSS, JavaScript base'],

    // Course 5: Data Science & ML
    ['Data Science & Machine Learning',
      'Corso completo di Data Science e Machine Learning. Dalla preparazione dati ai modelli avanzati di deep learning, con focus su applicazioni reali e production-ready ML systems.',
      'data', 'advanced', '65 ore',
      JSON.stringify([
        { title: 'Python per Data Science', description: 'NumPy, Pandas, visualizzazione dati', content: "## Python Data Stack\n- NumPy: calcolo numerico, broadcasting\n- Pandas: manipolazione dati tabulari\n- Visualizzazione: Matplotlib, Seaborn, Plotly" },
        { title: 'Machine Learning Classico', description: 'Supervised e unsupervised learning con Scikit-learn', content: "## ML con Scikit-learn\n- Classificazione: Logistic Regression, Random Forest, XGBoost\n- Regressione: Linear, Ridge, Gradient Boosting\n- Unsupervised: K-Means, DBSCAN, PCA\n- Metriche: Accuracy, F1, ROC-AUC, RMSE" },
        { title: 'Deep Learning', description: 'Neural networks, CNN, RNN, Transformers', content: "## Deep Learning con PyTorch\n- CNN per immagini\n- Transformers per NLP (BERT, GPT, T5)\n- Vision Transformer (ViT)" },
        { title: 'MLOps e Production ML', description: 'Deploy modelli ML in produzione', content: "## MLOps\n- MLflow per experiment tracking\n- Model Serving: FastAPI, TorchServe, SageMaker\n- Monitoring: data drift, model drift\n- A/B testing in produzione" }
      ]),
      'Data Scientist', 'Certificazione di competenza in data science e ML',
      '#f59e0b',
      JSON.stringify(['Python + SQL sono le competenze base richieste nel 95% degli annunci','XGBoost/LightGBM dominano i use case aziendali su dati tabulari','Esperienza con MLOps distingue un DS junior da un senior','Le aziende cercano candidati che sappiano comunicare i risultati','Competenze in NLP e LLM fine-tuning sono le più ricercate nel 2026']),
      'Python base, statistica fondamentale'],

    // Course 6: Database Administration
    ['Database Administration',
      'Corso professionale di amministrazione database. PostgreSQL, MySQL, MongoDB, ottimizzazione query, replica, backup, sicurezza. Preparazione per certificazioni Oracle DBA e MongoDB DBA.',
      'database', 'intermediate', '45 ore',
      JSON.stringify([
        { title: 'Progettazione Database Relazionali', description: 'Normalizzazione, ER modeling, schema design', content: "## Progettazione Database\n- ER Model: entità, attributi, relazioni\n- Normalizzazione: 1NF, 2NF, 3NF, BCNF\n- Denormalizzazione per performance\n- PostgreSQL Data Types avanzati" },
        { title: 'Query Optimization e Indexing', description: 'EXPLAIN ANALYZE, indici, query tuning', content: "## Query Optimization\n- EXPLAIN ANALYZE\n- Indici: B-Tree, GIN, GiST, BRIN\n- Partial Index, Composite Index\n- Anti-Pattern da evitare" },
        { title: 'Replica, Backup e High Availability', description: 'Strategie di replica, backup e disaster recovery', content: "## High Availability\n- Streaming Replication (sync/async)\n- Logical Replication\n- Backup: pg_dump, PITR\n- Tools: Patroni, PgBouncer, pgBackRest" },
        { title: 'NoSQL e Database Moderni', description: 'MongoDB, Redis, Elasticsearch, quando usare cosa', content: "## NoSQL\n- MongoDB: documenti, aggregation pipeline\n- Redis: caching, session store\n- Elasticsearch: full-text search\n- Quando usare cosa" },
        { title: 'Sicurezza Database', description: 'Hardening, encryption, audit e compliance', content: "## Sicurezza\n- Access Control, Row Level Security\n- Encryption: TDE, SSL/TLS, column-level\n- SQL Injection Prevention\n- Audit Logging (pgAudit)" }
      ]),
      'Database Administrator', 'Certificazione di competenza in database administration',
      '#f97316',
      JSON.stringify(['PostgreSQL è il database più richiesto dalle startup italiane','Le competenze di query optimization sono testate in quasi tutti i colloqui','Conoscere sia SQL che NoSQL è fondamentale','La certificazione MongoDB DBA Associate ha un ottimo ritorno','Esperienza con database security e compliance GDPR è un forte differenziatore']),
      'SQL base, concetti di sistemi operativi'],
  ];

  for (const course of courses) {
    await db.execute({
      sql: 'INSERT INTO courses (title, description, category, level, duration, modules, badge_name, badge_description, badge_color, company_tips, prerequisites) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: course,
    });
  }
  console.log(`✅ ${courses.length} courses seeded`);

  // ========== SEED QUIZZES ==========
  console.log('🔄 Seeding quizzes...');

  const quizzes = [
    [1, 'Quiz Fondamenti di Networking', JSON.stringify([
      { question: 'Quale livello del modello OSI è responsabile del routing dei pacchetti?', options: ['Layer 2 - Data Link', 'Layer 3 - Rete', 'Layer 4 - Trasporto', 'Layer 5 - Sessione'], correct: 1, explanation: "Il Layer 3 (Network/Rete) gestisce l'indirizzamento logico (IP) e il routing dei pacchetti tra reti diverse." },
      { question: 'Quanti host utilizzabili ha una subnet /26?', options: ['30', '62', '64', '126'], correct: 1, explanation: 'Una subnet /26 ha 6 bit per gli host: 2^6 = 64 indirizzi totali, meno rete e broadcast = 62 host utilizzabili.' },
      { question: 'Quale protocollo utilizza il three-way handshake (SYN, SYN-ACK, ACK)?', options: ['UDP', 'TCP', 'ICMP', 'ARP'], correct: 1, explanation: 'TCP è connection-oriented e stabilisce la connessione tramite un three-way handshake.' },
      { question: 'Quale tipo di record DNS mappa un nome di dominio a un indirizzo IPv4?', options: ['AAAA', 'CNAME', 'A', 'MX'], correct: 2, explanation: 'Il record A (Address) mappa un nome di dominio a un indirizzo IPv4.' },
      { question: "Nel processo DHCP, qual è l'ordine corretto delle fasi?", options: ['Request, Discover, Offer, Acknowledge', 'Discover, Offer, Request, Acknowledge', 'Offer, Discover, Acknowledge, Request', 'Discover, Request, Offer, Acknowledge'], correct: 1, explanation: 'Il processo DHCP segue l\'acronimo DORA: Discover, Offer, Request, Acknowledge.' },
      { question: "Quale protocollo di routing utilizza l'algoritmo di Dijkstra?", options: ['RIP', 'BGP', 'OSPF', 'EIGRP'], correct: 2, explanation: "OSPF utilizza l'algoritmo SPF di Dijkstra per calcolare il percorso ottimale." },
      { question: 'Quale range di indirizzi IPv4 privati appartiene alla Classe A (RFC 1918)?', options: ['172.16.0.0/12', '192.168.0.0/16', '10.0.0.0/8', '169.254.0.0/16'], correct: 2, explanation: 'La rete 10.0.0.0/8 è l\'indirizzo privato di Classe A (RFC 1918).' },
      { question: 'Cosa fa una porta trunk su uno switch?', options: ['Connette solo dispositivi di una VLAN', 'Trasporta traffico di multiple VLAN usando 802.1Q tagging', 'Blocca tutto il traffico VLAN', 'Gestisce solo traffico di management'], correct: 1, explanation: 'Una porta trunk trasporta frame di più VLAN contemporaneamente usando il protocollo 802.1Q.' },
      { question: 'Quale tipo di NAT permette a più indirizzi privati di condividere un singolo IP pubblico?', options: ['Static NAT', 'Dynamic NAT', 'PAT (Port Address Translation)', 'DNAT'], correct: 2, explanation: 'PAT (Port Address Translation) mappa più indirizzi interni a un singolo IP pubblico.' },
      { question: 'In IPv6, quale prefisso indica un indirizzo link-local?', options: ['2001::/3', 'fc00::/7', 'fe80::/10', 'ff00::/8'], correct: 2, explanation: 'Gli indirizzi link-local IPv6 usano il prefisso fe80::/10.' }
    ]), 70],

    [2, 'Quiz Cybersecurity Essentials', JSON.stringify([
      { question: 'Quale algoritmo di crittografia simmetrica è lo standard attuale?', options: ['RSA', 'AES', '3DES', 'Blowfish'], correct: 1, explanation: 'AES è lo standard attuale di crittografia simmetrica.' },
      { question: "Quale voce dell'OWASP Top 10 (2021) è al primo posto?", options: ['Injection', 'Broken Access Control', 'Cryptographic Failures', 'Security Misconfiguration'], correct: 1, explanation: 'Broken Access Control è al primo posto nell\'OWASP Top 10 2021.' },
      { question: 'Cosa garantisce la Perfect Forward Secrecy (PFS)?', options: ['Che i messaggi non possono essere modificati', 'Che la compromissione della chiave privata non compromette sessioni passate', "Che l'autenticazione è sempre verificata", 'Che i log non possono essere alterati'], correct: 1, explanation: 'PFS utilizza chiavi di sessione effimere per ogni connessione TLS.' },
      { question: 'In un Penetration Test, quale fase include Nmap?', options: ['Reconnaissance passiva', 'Scanning & Enumeration', 'Exploitation', 'Post-Exploitation'], correct: 1, explanation: 'La fase di Scanning & Enumeration include la scansione attiva delle porte.' },
      { question: 'Quale framework definisce le 5 funzioni core: Identify, Protect, Detect, Respond, Recover?', options: ['ISO 27001', 'NIST Cybersecurity Framework', 'OWASP', 'CIS Controls'], correct: 1, explanation: 'Il NIST Cybersecurity Framework definisce 5 funzioni core.' },
      { question: "Quanto tempo ha un'organizzazione per notificare un data breach secondo il GDPR?", options: ['24 ore', '48 ore', '72 ore', '7 giorni'], correct: 2, explanation: 'L\'articolo 33 del GDPR richiede la notifica entro 72 ore.' },
      { question: "Quale algoritmo è raccomandato per l'hashing delle password?", options: ['MD5', 'SHA-256', 'Argon2', 'AES-256'], correct: 2, explanation: 'Argon2 è l\'algoritmo raccomandato per password hashing.' },
      { question: 'Cosa sono gli Indicatori di Compromissione (IoC)?', options: ['Metriche di performance', 'Artefatti che indicano una potenziale compromissione', 'KPI per il team di sicurezza', 'Vulnerabilità note'], correct: 1, explanation: 'Gli IoC sono artefatti forensi che indicano una compromissione.' },
      { question: 'Nel modello Zero Trust, quale principio fondamentale viene applicato?', options: ['Trust but verify', 'Security through obscurity', 'Never trust, always verify', 'Implicit trust within the network'], correct: 2, explanation: 'Zero Trust si basa sul principio "Never trust, always verify".' },
      { question: 'Quale tipo di malware cifra i dati e richiede un riscatto?', options: ['Trojan', 'Rootkit', 'Ransomware', 'Spyware'], correct: 2, explanation: 'Il Ransomware cifra i file e richiede un pagamento per la chiave di decifrazione.' }
    ]), 70],

    [3, 'Quiz Cloud Computing & DevOps', JSON.stringify([
      { question: 'Quale modello di servizio cloud fornisce VM, storage e networking?', options: ['SaaS', 'PaaS', 'IaaS', 'FaaS'], correct: 2, explanation: 'IaaS fornisce risorse infrastrutturali virtualizzate.' },
      { question: 'In Kubernetes, quale componente del Control Plane mantiene lo stato del cluster?', options: ['API Server', 'etcd', 'Scheduler', 'kubelet'], correct: 1, explanation: 'etcd è un key-value store che mantiene tutto lo stato del cluster.' },
      { question: 'Quale comando Terraform mostra le modifiche pianificate?', options: ['terraform init', 'terraform plan', 'terraform apply', 'terraform validate'], correct: 1, explanation: "terraform plan mostra un'anteprima delle risorse che verranno modificate." },
      { question: 'Quale istruzione Dockerfile permette multi-stage builds?', options: ['FROM ... AS builder (multi-stage)', 'RUN --mount=type=cache', 'COPY --chown', 'HEALTHCHECK'], correct: 0, explanation: 'Il multi-stage build usa più istruzioni FROM con alias.' },
      { question: 'Quale servizio AWS è un object storage con classi multiple?', options: ['EBS', 'EFS', 'S3', 'FSx'], correct: 2, explanation: 'Amazon S3 è un object storage scalabile con diverse classi.' },
      { question: 'Quale tipo di Service Kubernetes espone i pod con IP interno?', options: ['NodePort', 'LoadBalancer', 'ClusterIP', 'ExternalName'], correct: 2, explanation: 'ClusterIP è il tipo di Service default, solo interno al cluster.' },
      { question: 'Quale query PromQL calcola il rate di richieste HTTP negli ultimi 5 minuti?', options: ['sum(http_requests_total)', 'rate(http_requests_total[5m])', 'increase(http_requests_total)', 'avg(http_requests_total[5m])'], correct: 1, explanation: 'rate() calcola il tasso di incremento per secondo di un counter.' },
      { question: 'Cosa sono gli SLO in ambito SRE?', options: ['Service Level Outages', 'Service Level Objectives', 'System Load Optimization', 'Service Log Operations'], correct: 1, explanation: 'SLO sono target interni di affidabilità basati su SLI misurabili.' },
      { question: 'Quale strategia di deployment aggiorna gradualmente le istanze?', options: ['Blue/Green', 'Canary', 'Rolling Update', 'Recreate'], correct: 2, explanation: 'Rolling Update sostituisce gradualmente le istanze vecchie con quelle nuove.' },
      { question: 'Quale tool gestisce certificati TLS gratuiti automatici?', options: ['HashiCorp Vault', "Let's Encrypt con ACME protocol", 'AWS Certificate Manager', 'OpenSSL'], correct: 1, explanation: "Let's Encrypt usa il protocollo ACME per automatizzare i certificati TLS." }
    ]), 70],

    [4, 'Quiz Full-Stack Web Development', JSON.stringify([
      { question: 'Quale hook React memoizza il risultato di un calcolo costoso?', options: ['useEffect', 'useMemo', 'useCallback', 'useRef'], correct: 1, explanation: 'useMemo memoizza il risultato di un calcolo, ricalcolandolo solo quando le dipendenze cambiano.' },
      { question: "In un'API REST, quale status code indica risorsa creata con successo?", options: ['200 OK', '201 Created', '204 No Content', '202 Accepted'], correct: 1, explanation: '201 Created indica che la richiesta ha portato alla creazione di una nuova risorsa.' },
      { question: 'Quale tecnica previene gli attacchi SQL Injection?', options: ['Input validation con regex', 'Prepared statements / parametrized queries', "Encoding dell'output", 'CORS headers'], correct: 1, explanation: 'I prepared statements separano il codice SQL dai dati.' },
      { question: 'In TypeScript, quale utility type rende tutti i campi opzionali?', options: ['Required<T>', 'Partial<T>', 'Pick<T, K>', 'Omit<T, K>'], correct: 1, explanation: 'Partial<T> costruisce un tipo con tutte le proprietà opzionali.' },
      { question: 'Quale approccio di paginazione è più efficiente per grandi dataset?', options: ['Offset-based (LIMIT/OFFSET)', 'Cursor-based (keyset pagination)', 'Page number-based', 'Nessuna differenza'], correct: 1, explanation: "Cursor-based pagination evita il costo O(n) dell'OFFSET." },
      { question: 'Quale metrica Core Web Vital misura la stabilità visuale?', options: ['LCP', 'FID', 'CLS', 'TTFB'], correct: 2, explanation: 'CLS misura la stabilità visuale quantificando gli spostamenti degli elementi.' },
      { question: 'Cosa fa React.lazy() insieme a Suspense?', options: ['Lazy evaluation delle props', 'Code splitting: carica componenti on-demand', 'Rendering ritardato', 'Memorizzazione lazy'], correct: 1, explanation: 'React.lazy() permette il code splitting a livello di componente.' },
      { question: "In JWT, dove dovrebbe essere memorizzato il refresh token in un'app web?", options: ['localStorage', 'sessionStorage', 'HttpOnly cookie', 'URL query parameter'], correct: 2, explanation: 'I refresh token dovrebbero essere in HttpOnly cookies, protetti da XSS.' },
      { question: 'Quale pattern risolve la comunicazione asincrona tra microservizi?', options: ['REST API calls', 'Message Queue (RabbitMQ, Kafka)', 'GraphQL subscriptions', 'Polling periodico'], correct: 1, explanation: 'Le Message Queue permettono comunicazione asincrona affidabile.' },
      { question: 'Quale tool fornisce analisi statica del codice?', options: ['Jest', 'Webpack', 'SonarQube', 'Storybook'], correct: 2, explanation: 'SonarQube esegue analisi statica rilevando bug e vulnerabilità.' }
    ]), 70],

    [5, 'Quiz Data Science & Machine Learning', JSON.stringify([
      { question: 'Quale metrica è appropriata per dataset fortemente sbilanciato?', options: ['Accuracy', 'F1-Score', 'Mean Squared Error', 'R-squared'], correct: 1, explanation: 'F1-Score bilancia Precision e Recall per dataset sbilanciati.' },
      { question: "Quale tecnica previene l'overfitting?", options: ['Aumentare le feature', 'Cross-validation e regularizzazione', 'Rimuovere il validation set', 'Aumentare la complessità'], correct: 1, explanation: 'Cross-validation e regularizzazione prevengono l\'overfitting.' },
      { question: 'In una CNN, cosa fa il Max Pooling?', options: ['Aumenta la dimensione spaziale', 'Riduce la dimensione spaziale mantenendo le feature importanti', 'Normalizza i valori', 'Connette tutti i neuroni'], correct: 1, explanation: 'Max Pooling riduce la dimensione spaziale selezionando il valore massimo.' },
      { question: 'Quale algoritmo è top performer per dati tabulari?', options: ['Deep Neural Network', 'Gradient Boosting (XGBoost/LightGBM)', 'SVM', 'KNN'], correct: 1, explanation: 'Gradient Boosting è il top performer per dati tabulari.' },
      { question: 'Cosa misura il data drift?', options: ['Degradazione velocità', 'Cambiamento distribuzione input vs training', 'Aumento richieste', 'Errori preprocessing'], correct: 1, explanation: 'Il data drift si verifica quando la distribuzione dei dati di input diverge da quella di training.' },
      { question: 'Quale architettura ha rivoluzionato il NLP?', options: ['LSTM', 'CNN', 'Transformer', 'Autoencoder'], correct: 2, explanation: "L'architettura Transformer ha rivoluzionato il NLP grazie al self-attention." },
      { question: 'A cosa serve StandardScaler?', options: ['Normalizza a media 0 e std 1', 'Seleziona feature', 'Codifica variabili categoriche', 'Riduce dimensionalità'], correct: 0, explanation: 'StandardScaler standardizza le feature con z-score.' },
      { question: 'Quale tool viene usato per experiment tracking ML?', options: ['Jupyter', 'MLflow', 'Docker', 'Git'], correct: 1, explanation: 'MLflow è la piattaforma standard per experiment tracking.' },
      { question: 'Quale tecnica di validazione è consigliata per dataset piccoli?', options: ['Holdout 80/20', 'K-Fold Cross Validation', 'Bootstrap', 'Nessuna'], correct: 1, explanation: 'K-Fold Cross Validation fornisce una stima più robusta con dataset limitati.' },
      { question: "Cos'è il problema N+1?", options: ['Un errore di indice', 'N query aggiuntive anziché usare JOIN', 'N+1 tabelle nel DB', 'Limite connessioni'], correct: 1, explanation: 'Il problema N+1 si risolve con JOIN, eager loading o batch loading.' }
    ]), 70],

    [6, 'Quiz Database Administration', JSON.stringify([
      { question: 'La 3NF richiede l\'eliminazione di quali dipendenze?', options: ['Funzionali', 'Parziali', 'Transitive', 'Multivalore'], correct: 2, explanation: 'La 3NF elimina le dipendenze transitive.' },
      { question: 'Quale tipo di indice PostgreSQL è ottimale per JSONB e array?', options: ['B-Tree', 'GIN', 'GiST', 'BRIN'], correct: 1, explanation: 'GIN è ottimizzato per valori compositi come array, JSONB e full-text search.' },
      { question: 'Cosa fa EXPLAIN ANALYZE in PostgreSQL?', options: ['Analizza la struttura', 'Esegue la query e mostra il piano reale con tempi', 'Ottimizza automaticamente', 'Verifica la sintassi'], correct: 1, explanation: 'EXPLAIN ANALYZE esegue la query e confronta le stime con i risultati reali.' },
      { question: 'Quale livello di isolamento previene phantom reads?', options: ['READ UNCOMMITTED', 'READ COMMITTED', 'REPEATABLE READ', 'SERIALIZABLE'], correct: 3, explanation: 'SERIALIZABLE previene tutti i fenomeni anomali.' },
      { question: 'Cosa garantisce la streaming replication sincrona?', options: ['Migliore performance', 'Zero data loss (RPO = 0)', 'Distribuzione carico lettura', 'Failover automatico'], correct: 1, explanation: 'La streaming replication sincrona garantisce RPO = 0.' },
      { question: 'Quale anti-pattern SQL causa degradazione performance?', options: ['Uso di indici compositi', 'SELECT * in produzione', 'Prepared statements', 'Connection pooling'], correct: 1, explanation: 'SELECT * recupera colonne non necessarie, impedendo l\'uso di covering index.' },
      { question: 'In MongoDB, quale operazione filtra i documenti?', options: ['$group', '$project', '$match', '$sort'], correct: 2, explanation: '$match filtra i documenti, simile a WHERE in SQL.' },
      { question: 'Quale strategia consente Point-In-Time Recovery?', options: ['pg_dump giornaliero', 'Base backup + continuous WAL archiving', 'Snapshot storage', 'Logical replication'], correct: 1, explanation: 'PITR richiede base backup + WAL archiving continuo.' },
      { question: 'Quale database è appropriato per cache ad alta velocità con TTL?', options: ['PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch'], correct: 2, explanation: 'Redis è un in-memory data store con TTL nativo.' },
      { question: "Quale tecnica PostgreSQL limita l'accesso a livello di riga?", options: ['GRANT/REVOKE', 'Row Level Security (RLS)', 'SSL/TLS', 'pg_hba.conf'], correct: 1, explanation: 'RLS permette di definire policy che filtrano le righe per ciascun utente.' }
    ]), 70],
  ];

  for (const quiz of quizzes) {
    await db.execute({
      sql: 'INSERT INTO quizzes (course_id, title, questions, passing_score) VALUES (?, ?, ?, ?)',
      args: quiz,
    });
  }
  console.log(`✅ ${quizzes.length} quizzes seeded`);

  console.log('\n🎉 Database seeded successfully!');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
