--
-- PostgreSQL database dump
--

-- Dumped from database version 14.2
-- Dumped by pg_dump version 14.2

-- Started on 2022-04-14 13:31:56

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 827 (class 1247 OID 16405)
-- Name: categ_carti; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.categ_carti AS ENUM (
    'Literatură română',
    'Literatură străină',
    'Poezie',
    'Dicționare',
    'Manuale școlare'
);


ALTER TYPE public.categ_carti OWNER TO postgres;

--
-- TOC entry 839 (class 1247 OID 16449)
-- Name: roluri; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.roluri AS ENUM (
    'admin',
    'moderator',
    'comun'
);


ALTER TYPE public.roluri OWNER TO postgres;

--
-- TOC entry 830 (class 1247 OID 16416)
-- Name: tip_carti; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tip_carti AS ENUM (
    'Carte',
    'Revistă',
    'Ziar'
);


ALTER TYPE public.tip_carti OWNER TO postgres;

--
-- TOC entry 833 (class 1247 OID 16424)
-- Name: tip_coperta; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tip_coperta AS ENUM (
    'Hârtie',
    'Piele',
    'Plastic reciclat'
);


ALTER TYPE public.tip_coperta OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 214 (class 1259 OID 16470)
-- Name: accesari; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accesari (
    id integer NOT NULL,
    ip character varying(100) NOT NULL,
    user_id integer,
    pagina character varying(500) NOT NULL,
    data_accesare timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.accesari OWNER TO postgres;

--
-- TOC entry 213 (class 1259 OID 16469)
-- Name: accesari_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.accesari_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.accesari_id_seq OWNER TO postgres;

--
-- TOC entry 3360 (class 0 OID 0)
-- Dependencies: 213
-- Name: accesari_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.accesari_id_seq OWNED BY public.accesari.id;


--
-- TOC entry 210 (class 1259 OID 16432)
-- Name: carti; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carti (
    id integer NOT NULL,
    nume character varying(50) NOT NULL,
    autor character varying(50) NOT NULL,
    descriere text,
    pret numeric(8,2) NOT NULL,
    nr_pagini integer NOT NULL,
    categorie public.categ_carti DEFAULT 'Literatură română'::public.categ_carti,
    tip public.tip_carti DEFAULT 'Carte'::public.tip_carti,
    coperta public.tip_coperta DEFAULT 'Hârtie'::public.tip_coperta,
    genuri_literare character varying[],
    pentru_copii boolean DEFAULT false NOT NULL,
    imagine character varying(300),
    data_adaugare timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT carti_nr_pagini_check CHECK ((nr_pagini >= 0))
);


ALTER TABLE public.carti OWNER TO postgres;

--
-- TOC entry 209 (class 1259 OID 16431)
-- Name: carti_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.carti_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.carti_id_seq OWNER TO postgres;

--
-- TOC entry 3362 (class 0 OID 0)
-- Dependencies: 209
-- Name: carti_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.carti_id_seq OWNED BY public.carti.id;


--
-- TOC entry 212 (class 1259 OID 16456)
-- Name: utilizatori; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.utilizatori (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    nume character varying(100) NOT NULL,
    prenume character varying(100) NOT NULL,
    parola character varying(500) NOT NULL,
    rol public.roluri DEFAULT 'comun'::public.roluri NOT NULL,
    email character varying(100) NOT NULL,
    culoare_chat character varying(50) NOT NULL,
    data_adaugare timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    cod character varying(200),
    confirmat_mail boolean DEFAULT false
);


ALTER TABLE public.utilizatori OWNER TO postgres;

--
-- TOC entry 211 (class 1259 OID 16455)
-- Name: utilizatori_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.utilizatori_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.utilizatori_id_seq OWNER TO postgres;

--
-- TOC entry 3364 (class 0 OID 0)
-- Dependencies: 211
-- Name: utilizatori_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.utilizatori_id_seq OWNED BY public.utilizatori.id;


--
-- TOC entry 3197 (class 2604 OID 16473)
-- Name: accesari id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accesari ALTER COLUMN id SET DEFAULT nextval('public.accesari_id_seq'::regclass);


--
-- TOC entry 3186 (class 2604 OID 16435)
-- Name: carti id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carti ALTER COLUMN id SET DEFAULT nextval('public.carti_id_seq'::regclass);


--
-- TOC entry 3193 (class 2604 OID 16459)
-- Name: utilizatori id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilizatori ALTER COLUMN id SET DEFAULT nextval('public.utilizatori_id_seq'::regclass);


--
-- TOC entry 3354 (class 0 OID 16470)
-- Dependencies: 214
-- Data for Name: accesari; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3350 (class 0 OID 16432)
-- Dependencies: 210
-- Data for Name: carti; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.carti (id, nume, autor, descriere, pret, nr_pagini, categorie, tip, coperta, genuri_literare, pentru_copii, imagine, data_adaugare) VALUES (1, 'Ion', 'Liviu Rebreanu', 'Liviu Rebreanu este creatorul romanului românesc modern, deoarece scrie primul roman obiectiv din literatura română, Ion și primul roman de analiză psihologică din proza românească, Pădurea Spânzuraților.', 20.50, 252, 'Literatură română', 'Carte', 'Plastic reciclat', '{epic,modern,obiectiv,social}', true, 'imagine-ion-lr.jpg', '2022-03-28 17:05:55.50852');
INSERT INTO public.carti (id, nume, autor, descriere, pret, nr_pagini, categorie, tip, coperta, genuri_literare, pentru_copii, imagine, data_adaugare) VALUES (2, '1984', 'George Orwell', 'Nineteen Eighty-Four (also stylised as 1984) is a dystopian social science fiction novel and cautionary tale written by English writer George Orwell.', 34.90, 120, 'Literatură străină', 'Carte', 'Hârtie', '{epic,SF,social}', true, 'imagine-1984-go.jpg', '2022-03-28 17:05:55.50852');
INSERT INTO public.carti (id, nume, autor, descriere, pret, nr_pagini, categorie, tip, coperta, genuri_literare, pentru_copii, imagine, data_adaugare) VALUES (3, 'Enigma Otiliei', 'George Călinescu', 'Enigma Otiliei este un roman de tip balzacian scris de George Călinescu în anul 1938.', 15.00, 335, 'Literatură română', 'Carte', 'Piele', '{epic,subiectiv,social,balzacian}', false, 'imagine-enigma_otiliei-gc.jpg', '2022-03-28 17:05:55.50852');
INSERT INTO public.carti (id, nume, autor, descriere, pret, nr_pagini, categorie, tip, coperta, genuri_literare, pentru_copii, imagine, data_adaugare) VALUES (5, 'Poezii alese', 'Mihai Eminescu', 'Mihai Eminescu was a Romanian Romantic poet from Moldavia, novelist, and journalist, generally regarded as the most famous and influential Romanian poet.', 42.00, 165, 'Poezie', 'Carte', 'Piele', '{liric,subiectiv,romantic}', true, 'imagine-poezii-me.jpg', '2022-03-30 21:07:07.407778');
INSERT INTO public.carti (id, nume, autor, descriere, pret, nr_pagini, categorie, tip, coperta, genuri_literare, pentru_copii, imagine, data_adaugare) VALUES (6, 'Matematică - clasa a XII-a', 'George Burtea', 'Manual de matematică pentru clasa a XII-a, profil real, avizat de Ministerul Educației.', 24.00, 275, 'Manuale școlare', 'Carte', 'Plastic reciclat', '{matematică}', true, 'imagine-matematica-gb.jpg', '2022-03-30 21:07:07.407778');
INSERT INTO public.carti (id, nume, autor, descriere, pret, nr_pagini, categorie, tip, coperta, genuri_literare, pentru_copii, imagine, data_adaugare) VALUES (4, 'Gazeta Sporturilor', 'Cristian Geambașu', 'Gazeta Sporturilor (English: The Sports Gazette) is a daily Romanian newspaper, and the country`s largest and most read sports-related publication.', 7.00, 25, 'Literatură română', 'Ziar', 'Hârtie', '{obiectiv,social}', true, 'imagine-gsp-cg.jpg', '2022-03-30 21:07:07.407778');
INSERT INTO public.carti (id, nume, autor, descriere, pret, nr_pagini, categorie, tip, coperta, genuri_literare, pentru_copii, imagine, data_adaugare) VALUES (7, 'Ziarul Lumina', 'Arhiepiscopia București', 'Singura publicație clericală din România.', 9.20, 35, 'Literatură română', 'Ziar', 'Hârtie', '{obiectiv,religie}', false, 'imagine-lumina-ab.jpg', '2022-04-09 11:31:20.432404');
INSERT INTO public.carti (id, nume, autor, descriere, pret, nr_pagini, categorie, tip, coperta, genuri_literare, pentru_copii, imagine, data_adaugare) VALUES (8, 'Revista Ferma', 'Ferma Media Group', 'Cartea de vizită a fermierului.', 20.00, 53, 'Literatură română', 'Revistă', 'Plastic reciclat', '{obiectiv}', false, 'imagine-rf-fme.jpg', '2022-04-09 11:31:20.432404');
INSERT INTO public.carti (id, nume, autor, descriere, pret, nr_pagini, categorie, tip, coperta, genuri_literare, pentru_copii, imagine, data_adaugare) VALUES (9, 'go4it', 'Gândul Media Network', 'Revista zilei de azi și mâine: aici vei vedea ultimele tehnologii și nu numai.', 20.00, 45, 'Literatură română', 'Revistă', 'Hârtie', '{obiectiv}', true, 'imagine-go4it-gmn.jpg', '2022-04-09 11:31:20.432404');
INSERT INTO public.carti (id, nume, autor, descriere, pret, nr_pagini, categorie, tip, coperta, genuri_literare, pentru_copii, imagine, data_adaugare) VALUES (10, 'Dicționar Român-Englez', 'Andrei Bantaș', 'Cititi zilnic din dictionare si veti vedea ca ele va ofera mai multe surprize decat romanele politiste! (Dar nu totdeauna agreabile pentru cei ce pacatuiesc!) Cea mai palpitanta lectura a secolului nostru: Dictionarul de pronuntarea limbii engleze!', 65.00, 330, 'Dicționare', 'Carte', 'Plastic reciclat', '{dicționar}', true, 'imagine-dictionarre-ab.jpg', '2022-04-09 11:31:20.432404');


--
-- TOC entry 3352 (class 0 OID 16456)
-- Dependencies: 212
-- Data for Name: utilizatori; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.utilizatori (id, username, nume, prenume, parola, rol, email, culoare_chat, data_adaugare, cod, confirmat_mail) VALUES (3, 'prof78292', 'Gogulescu', 'Gogu', '15a3e13b045ac210a1fcbfc349e5e021f0747ca3a27ab9cd681579e195f9bb0fb2c51bcbb0b84284450f7f005366c351f52ae63b4b5e96cc98809c122ebc1a5f', 'comun', 'profprofprof007@gmail.com', 'green', '2022-04-13 07:47:01.831889', NULL, false);


--
-- TOC entry 3365 (class 0 OID 0)
-- Dependencies: 213
-- Name: accesari_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.accesari_id_seq', 1, false);


--
-- TOC entry 3366 (class 0 OID 0)
-- Dependencies: 209
-- Name: carti_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.carti_id_seq', 10, true);


--
-- TOC entry 3367 (class 0 OID 0)
-- Dependencies: 211
-- Name: utilizatori_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.utilizatori_id_seq', 3, true);


--
-- TOC entry 3208 (class 2606 OID 16478)
-- Name: accesari accesari_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accesari
    ADD CONSTRAINT accesari_pkey PRIMARY KEY (id);


--
-- TOC entry 3200 (class 2606 OID 16447)
-- Name: carti carti_nume_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carti
    ADD CONSTRAINT carti_nume_key UNIQUE (nume);


--
-- TOC entry 3202 (class 2606 OID 16445)
-- Name: carti carti_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carti
    ADD CONSTRAINT carti_pkey PRIMARY KEY (id);


--
-- TOC entry 3204 (class 2606 OID 16466)
-- Name: utilizatori utilizatori_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilizatori
    ADD CONSTRAINT utilizatori_pkey PRIMARY KEY (id);


--
-- TOC entry 3206 (class 2606 OID 16468)
-- Name: utilizatori utilizatori_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilizatori
    ADD CONSTRAINT utilizatori_username_key UNIQUE (username);


--
-- TOC entry 3209 (class 2606 OID 16479)
-- Name: accesari accesari_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accesari
    ADD CONSTRAINT accesari_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.utilizatori(id);


--
-- TOC entry 3361 (class 0 OID 0)
-- Dependencies: 210
-- Name: TABLE carti; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.carti TO mihai145;


--
-- TOC entry 3363 (class 0 OID 0)
-- Dependencies: 209
-- Name: SEQUENCE carti_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.carti_id_seq TO mihai145;


-- Completed on 2022-04-14 13:31:57

--
-- PostgreSQL database dump complete
--

