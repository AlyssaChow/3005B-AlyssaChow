CREATE TABLE public.users
(
    "user_ID" bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 0 MAXVALUE 9223372036854775807 CACHE 1 ),
    user_lname text COLLATE pg_catalog."default" NOT NULL,
    user_fname text COLLATE pg_catalog."default" NOT NULL,
    user_address character varying(50) COLLATE pg_catalog."default" NOT NULL,
    "user_phoneNum" text COLLATE pg_catalog."default" NOT NULL,
    user_email character varying(50) COLLATE pg_catalog."default" NOT NULL,
    user_pass character varying(256) COLLATE pg_catalog."default" NOT NULL,
    user_cardnumber text COLLATE pg_catalog."default",
    CONSTRAINT user_pkey PRIMARY KEY ("user_ID")
);

CREATE TABLE public.book
(
    "book_ID" bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    book_name text COLLATE pg_catalog."default" NOT NULL,
    book_isbn bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 999999 MINVALUE 999999 MAXVALUE 9223372036854775807 CACHE 1 ),
    book_genre text COLLATE pg_catalog."default" NOT NULL,
    book_pages integer NOT NULL,
    book_publisher text COLLATE pg_catalog."default" NOT NULL,
    book_price double precision NOT NULL,
    book_date date NOT NULL,
    book_stock integer NOT NULL,
    book_percentage double precision NOT NULL DEFAULT 0.0,
    book_authornamef text COLLATE pg_catalog."default" NOT NULL,
    book_authornamel text COLLATE pg_catalog."default" NOT NULL,
    book_sold integer NOT NULL,
    PRIMARY KEY ("book_ID")
);

CREATE TABLE public.author
(
    "author_ID" bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    author_lname text COLLATE pg_catalog."default" NOT NULL,
    author_fname text COLLATE pg_catalog."default" NOT NULL,
    PRIMARY KEY ("author_ID")
);


CREATE TABLE public.orders
(
    order_num bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    order_user bigint NOT NULL,
    order_address text COLLATE pg_catalog."default" NOT NULL,
    order_date date NOT NULL DEFAULT now(),
    PRIMARY KEY (order_num),
    FOREIGN KEY (order_user) references users
);

CREATE TABLE public.order_book
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    "order_ID" bigint,
    "book_ID" bigint,
    price double precision,
    PRIMARY KEY (id),
    FOREIGN KEY ("order_ID") references orders
);

CREATE TABLE public.owner
(
    owner_email text COLLATE pg_catalog."default" NOT NULL,
    owner_password text COLLATE pg_catalog."default" NOT NULL,
    "owner_ID" bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    owner_lname text COLLATE pg_catalog."default" NOT NULL,
    owner_fname text COLLATE pg_catalog."default" NOT NULL,
    PRIMARY KEY ("owner_ID")
);

CREATE TABLE public.publisher
(
    "p_ID" bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    p_name text COLLATE pg_catalog."default" NOT NULL,
    p_address text COLLATE pg_catalog."default" NOT NULL,
    p_email character varying(50) COLLATE pg_catalog."default" NOT NULL,
    "p_phoneNum" text COLLATE pg_catalog."default" NOT NULL,
    "p_bankAccount" bigint NOT NULL,
    PRIMARY KEY ("p_ID")
);






