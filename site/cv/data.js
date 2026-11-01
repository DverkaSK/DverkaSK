// Всё содержимое резюме. Правится только этот файл, разметку трогать не нужно.
// Общие поля (имя, контакты, образование, языки) — сверху; variants — три варианта резюме,
// каждый со своей ролью, «О кандидате», опытом и навыками. Текстовое поле — { ru, en } или строка, общая для обоих языков.
window.CV = {
  "name": {
    "ru": "Дорохин Игорь",
    "en": "Igor Dorokhin"
  },
  "meta": [
    {
      "ru": "Москва",
      "en": "Moscow, Russia"
    },
    {
      "text": "dverkask@gmail.com",
      "href": "mailto:dverkask@gmail.com"
    },
    {
      "text": "Telegram @DverkaSK",
      "href": "https://t.me/DverkaSK"
    },
    {
      "text": "github.com/DverkaSK",
      "href": "https://github.com/DverkaSK"
    },
    {
      "ru": "Гибрид / удалённо",
      "en": "Hybrid / remote"
    }
  ],
  "education": [
    {
      "school": {
        "ru": "НИЯУ МИФИ",
        "en": "MEPhI (National Research Nuclear University)"
      },
      "degree": {
        "ru": "магистратура, 09.04.04 Программная инженерия (разработка ПО)",
        "en": "Master's, 09.04.04 Software Engineering (software development)"
      },
      "years": "2026 — 2028"
    },
    {
      "school": {
        "ru": "РУТ (МИИТ), ИУЦТ",
        "en": "Russian University of Transport (MIIT)"
      },
      "degree": {
        "ru": "бакалавриат, 09.03.02 Информационные системы и технологии",
        "en": "Bachelor's, 09.03.02 Information Systems and Technologies"
      },
      "years": "2022 — 2026"
    },
    {
      "school": {
        "ru": "РУТ (МИИТ), ИУЦТ",
        "en": "Russian University of Transport (MIIT)"
      },
      "degree": {
        "ru": "цифровая кафедра: «Аналитик данных» (ИИ и машинное обучение)",
        "en": "professional retraining: Data Analyst (AI and machine learning)"
      },
      "years": "2025 — 2026"
    }
  ],
  "languages": [
    {
      "name": {
        "ru": "русский",
        "en": "Russian"
      },
      "level": {
        "ru": "родной",
        "en": "native"
      }
    },
    {
      "name": {
        "ru": "английский",
        "en": "English"
      },
      "level": {
        "ru": "B2 (Upper-Intermediate)",
        "en": "B2 (Upper-Intermediate)"
      }
    }
  ],
  "variants": {
    "java": {
      "label": {
        "ru": "Java Backend",
        "en": "Java Backend"
      },
      "file": {
        "ru": "Дорохин_Игорь_Java_Backend",
        "en": "Dorokhin_Igor_Java_Backend"
      },
      "role": {
        "ru": "Middle Java Backend Developer · Spring Boot · AI / LLM",
        "en": "Middle Java Backend Developer · Spring Boot · AI / LLM"
      },
      "about": {
        "ru": [
          "Более 3 лет коммерческой разработки, из них 2,5 года на Java / Spring Boot в InsurTech/FinTech. Делаю микросервисную платформу актуарных расчётов и регуляторной отчётности для НПФ, страховых компаний и банков. В основном работаю над backend-ом: аудит и безопасность, оркестрация расчётов, интеграции через Kafka, отчётность.",
          "Внедряю LLM в продукт: с нуля сделал RAG-ассистента по документации платформы на локальной модели, каждый день работаю с Claude Code. Сам довожу сервисы до продакшена: CI/CD, Docker, мониторинг в Prometheus и Grafana."
        ],
        "en": [
          "3+ years of commercial development, including 2.5 years of Java / Spring Boot in InsurTech/FinTech. I build a microservice platform for actuarial calculations and regulatory reporting used by pension funds, insurers and banks. Mostly backend: audit and security, calculation orchestration, Kafka integrations, reporting.",
          "I bring LLMs into the product: built a RAG assistant for the platform documentation from scratch on a local model, and use Claude Code every day. I take services all the way to production: CI/CD, Docker, monitoring with Prometheus and Grafana."
        ]
      },
      "jobs": [
        {
          "title": {
            "ru": "Java Backend Developer",
            "en": "Java Backend Developer"
          },
          "company": {
            "ru": "RTL Consulting (бывш. SAS Enterprise)",
            "en": "RTL Consulting (formerly SAS Enterprise)"
          },
          "period": {
            "ru": "Май 2024 — настоящее время",
            "en": "May 2024 — present"
          },
          "summary": {
            "ru": "Платформа актуарных расчётов и отчётности по МСФО 17 для НПФ, страховых компаний и банков (продукты ПДС, ОПС, НПО). Аналитики сами настраивают в ней таблицы, справочники, расчёты и процессы согласования через интерфейс, без программистов. Среди клиентов — СберНПФ, ВТБ, Газфонд ПН, Благосостояние и Ренессанс страхование. Стек: Java 17, Spring Boot 3, PostgreSQL, Kafka, Keycloak, ClickHouse, MongoDB, Elasticsearch, S3/MinIO, Vault, Kubernetes.",
            "en": "Platform for actuarial calculations and IFRS 17 reporting for pension funds, insurers and banks. Analysts configure tables, reference lists, calculations and approval workflows themselves through the UI, without developers. Clients include SberNPF, VTB, Gazfond, Blagosostoyanie and Renaissance Insurance. Stack: Java 17, Spring Boot 3, PostgreSQL, Kafka, Keycloak, ClickHouse, MongoDB, Elasticsearch, S3/MinIO, Vault, Kubernetes."
          },
          "groups": [
            {
              "title": {
                "ru": "Audit & Security",
                "en": "Audit & Security"
              },
              "items": {
                "ru": [
                  "Спроектировал журнал аудита с нуля: модель событий, сбор через Spring AOP-аспекты, серверная пагинация и фильтры, потоковый экспорт в CSV/XLSX, индексы PostgreSQL, политика хранения логов",
                  "Вынес журнал в отдельный сервис событий и написал общую библиотеку для отправки событий через Kafka (AOP, обработка ошибок Kafka). На неё переведены сервисы задач, отчётов и файлов. При росте до миллионов записей перевёл его с PostgreSQL на ClickHouse, выборки ускорились в 3 раза",
                  "Подключил SIEM: выгрузка событий безопасности с IP-адресом и таймзоной, отслеживание сессий Keycloak, неуспешных входов, неавторизованных запросов и админ-событий",
                  "Секреты 5 сервисов в HashiCorp Vault, сквозной sessionId в логах через MDC, ролевая модель с историей версий",
                  "Проверка безопасности по OWASP Top 10: сканирование OWASP ZAP, защита от SQL-инъекций в фильтрах и динамических запросах к БД"
                ],
                "en": [
                  "Designed the audit log from scratch: event model, collection via Spring AOP aspects, server-side pagination, filtering and sorting, streaming CSV/XLSX export, PostgreSQL indexes, retention policy and log cleanup",
                  "Moved the log into a dedicated event service and wrote a shared library for publishing events to Kafka (AOP, custom Kafka error handling); the task, report and file services were migrated to it. When the log grew to millions of records, moved its storage from PostgreSQL to ClickHouse, making queries about 3x faster",
                  "Integrated SIEM: security events with IP address and time zone, Keycloak session tracking, failed logins and unauthorized requests, scheduled export of admin events (lockouts, password changes)",
                  "Connected 5 services to HashiCorp Vault for secrets; end-to-end sessionId in logs via MDC; role model with role version history",
                  "Security checks against the OWASP Top 10: OWASP ZAP scans, SQL injection protection in filters and dynamic database queries"
                ]
              }
            },
            {
              "title": {
                "ru": "AI Documentation Assistant (RAG)",
                "en": "AI Documentation Assistant (RAG)"
              },
              "items": {
                "ru": [
                  "С нуля сделал RAG-сервис, который отвечает на вопросы по инструкциям платформы и CRM: Python, FastAPI, LangChain, локальная LLM в Ollama, pgvector. Разбор docx и Markdown на блоки с картинками, ответы только по документам и со ссылками на источники",
                  "Админка документов, развёртывание на GPU в Docker Compose с лимитами ресурсов, метрики токенов и времени ответа в Prometheus и Grafana, нагрузочные тесты на k6"
                ],
                "en": [
                  "Built a RAG service from scratch that answers questions about the platform and CRM manuals: Python, FastAPI, LangChain, a local LLM in Ollama, pgvector. Parsing docx and Markdown into blocks with images; answers strictly from the documents with source links",
                  "Document admin panel, GPU deployment in Docker Compose with resource limits, token and latency metrics in Prometheus and Grafana, k6 load tests"
                ]
              }
            },
            {
              "title": {
                "ru": "Calculation Orchestration",
                "en": "Calculation Orchestration"
              },
              "items": {
                "ru": [
                  "Механизм цепочек расчётов в оркестраторе: зависимости между калькуляторами описываются графом (DAG), независимые расчёты запускаются параллельно, зависимые — когда готовы их входные данные. Отмена цепочки и общий статус выполнения",
                  "Отчётные периоды: генерация через очереди, жизненный цикл статусов, резолверы финальности, защита от дублей, блокировка повторного согласования"
                ],
                "en": [
                  "Calculation chains in the orchestrator: dependencies between calculators form a graph (DAG); independent calculations run in parallel, dependent ones start once their inputs are ready. Chain cancellation and overall execution status",
                  "Reporting periods: queue-based generation, status lifecycle, finality resolvers, duplicate protection, blocking repeated approval"
                ]
              }
            },
            {
              "title": {
                "ru": "Data, Integrations & Reporting",
                "en": "Data, Integrations & Reporting"
              },
              "items": {
                "ru": [
                  "Треугольники развития убытков: логику вынес в отдельный сервис, написал алгоритм классификации, фильтрацию и разграничение доступа через RBAC",
                  "Подключения к внешним БД, включая ClickHouse, и выгрузка данных в них через Kafka (с поддержкой составных ключей). Перевёл сервис интеграций со Spring Boot на Quarkus. Перенёс документы с глубоко вложенным JSON из PostgreSQL в MongoDB",
                  "Отчёты на JasperReports и Apache POI: отчёт по доходности фондов относительно бенчмарка, генерация графиков, превью docx/pdf. Глобальный поиск по сущностям на Elasticsearch"
                ],
                "en": [
                  "Loss development triangles: moved the logic into a separate service, wrote the classification algorithm, filtering and RBAC-based access control",
                  "Connections to external databases including ClickHouse, with data export to them over Kafka (composite keys supported). Migrated the integration service from Spring Boot to Quarkus. Moved documents with deeply nested JSON from PostgreSQL to MongoDB",
                  "Reports with JasperReports and Apache POI: fund performance against a benchmark, chart generation, docx/pdf previews. Global entity search on Elasticsearch"
                ]
              }
            },
            {
              "title": {
                "ru": "DevOps & Infrastructure",
                "en": "DevOps & Infrastructure"
              },
              "items": {
                "ru": [
                  "CI/CD в GitLab CI: сборка, тесты, Docker-образы и автодеплой в Kubernetes; Docker Compose для тестов",
                  "Мониторинг: health-check и метрики Micrometer / Prometheus, дашборды в Grafana, алерты на недоступность сервисов, обрывы соединений и ошибки расчётов"
                ],
                "en": [
                  "GitLab CI/CD: build, tests, Docker images and automated deployment to Kubernetes; Docker Compose for test environments",
                  "Monitoring: health checks and Micrometer / Prometheus metrics, Grafana dashboards, alerts on service outages, connection drops and calculation errors"
                ]
              }
            },
            {
              "title": {
                "ru": "Quality & Engineering",
                "en": "Quality & Engineering"
              },
              "items": {
                "ru": [
                  "Интеграционные тесты на Testcontainers (PostgreSQL, Keycloak, Elasticsearch, Vault) и WireMock с webhook-расширениями. Сценарии оркестратора покрыл тестами по диаграммам последовательности, настроил их запуск в GitLab CI",
                  "Разделял монолит на микросервисы: вынес в отдельные сервисы журнал событий, треугольники убытков и интеграции. Параллельно перевёл проект с Java 8 на Java 17 и Spring Boot 3"
                ],
                "en": [
                  "Integration tests with Testcontainers (PostgreSQL, Keycloak, Elasticsearch, Vault) and WireMock with webhook extensions; covered orchestrator scenarios from sequence diagrams and wired them into GitLab CI",
                  "Split the monolith into microservices: moved the audit log, loss triangles and integrations into separate services. Along the way migrated the project from Java 8 to Java 17 and Spring Boot 3"
                ]
              }
            }
          ]
        },
        {
          "title": {
            "ru": "Fullstack Developer",
            "en": "Fullstack Developer"
          },
          "company": {
            "ru": "АО «ВНИИЖТ» (проектная работа)",
            "en": "VNIIZhT, railway transport research institute (project work)"
          },
          "period": {
            "ru": "2023 — 2024",
            "en": "2023 — 2024"
          },
          "summary": {
            "ru": "АО «ВНИИЖТ» — научно-исследовательский институт железнодорожного транспорта, разработчик АПК «ЭЛЬБРУС» для управления перевозками. Сделал базу знаний «вопрос — ответ» вместо переписки по почте: специалисты подтверждают ответы, пользователи находят решения сами. Вёл проект один, от проектирования до развёртывания.",
            "en": "VNIIZhT is the Russian railway transport research institute and the developer of ELBRUS, a suite for managing freight operations. Built a Q&A knowledge base for the institute to replace email support: specialists verify answers, users find solutions on their own. Ran the project solo, from design to deployment."
          },
          "groups": [
            {
              "title": {
                "ru": "Backend",
                "en": "Backend"
              },
              "items": {
                "ru": [
                  "Go (chi, pgx, миграции goose), PostgreSQL, MinIO: 34 REST-метода с документацией в Swagger, сессионная аутентификация и роли, голосование за ответы, вложения, email-уведомления, поиск с фильтрами, автоподбор тегов, импорт и экспорт",
                  "RAG-ассистент, который отвечает на вопросы пользователей на основе базы знаний",
                  "CI/CD на GitHub Actions: сборка образа в GHCR и автодеплой; Docker Compose с Nginx, поставка в закрытую сеть без интернета. Нагрузочные тесты k6, проверка безопасности OWASP ZAP"
                ],
                "en": [
                  "Go (chi, pgx, goose migrations), PostgreSQL, MinIO: 34 REST endpoints documented in Swagger, session authentication and roles, answer voting, attachments, email notifications, filtered search, automatic tagging, import and export",
                  "RAG assistant that answers user questions based on the knowledge base",
                  "GitHub Actions CI/CD: image build to GHCR and auto-deploy; Docker Compose with Nginx, delivery to an air-gapped network. k6 load tests, OWASP ZAP security scan"
                ]
              }
            },
            {
              "title": {
                "ru": "Frontend",
                "en": "Frontend"
              },
              "items": {
                "ru": [
                  "React 19 и TypeScript (Vite, Tailwind): вопросы, ответы и комментарии, поиск, профиль, вложения"
                ],
                "en": [
                  "React 19 and TypeScript (Vite, Tailwind): questions, answers and comments, search, profile, attachments"
                ]
              }
            }
          ]
        }
      ],
      "skills": [
        {
          "label": {
            "ru": "Backend",
            "en": "Backend"
          },
          "items": "Java 17+, Kotlin, Spring Boot 3, Spring Data JPA / Hibernate, Spring Security (OAuth2/OIDC), Spring AOP, Spring Cloud, Quarkus, REST, OpenAPI / Swagger, MapStruct, Lombok, Go"
        },
        {
          "label": {
            "ru": "AI / LLM",
            "en": "AI / LLM"
          },
          "items": {
            "ru": "RAG, LangChain, Ollama, pgvector, эмбеддинги, промпт-инжиниринг, Claude Code, Python",
            "en": "RAG, LangChain, Ollama, pgvector, embeddings, prompt engineering, Claude Code, Python"
          }
        },
        {
          "label": {
            "ru": "Data",
            "en": "Data"
          },
          "items": {
            "ru": "PostgreSQL, SQL, Liquibase, ClickHouse, MongoDB, Elasticsearch, Redis, S3/MinIO",
            "en": "PostgreSQL, SQL, Liquibase, ClickHouse, MongoDB, Elasticsearch, Redis, S3/MinIO"
          }
        },
        {
          "label": {
            "ru": "Infrastructure",
            "en": "Infrastructure"
          },
          "items": "Git, Gradle, Kafka, Keycloak, HashiCorp Vault, Docker / Docker Compose, Kubernetes, GitLab CI, GitHub Actions, Prometheus / Micrometer, Grafana, SIEM, Nginx, Linux / Bash"
        },
        {
          "label": {
            "ru": "Testing",
            "en": "Testing"
          },
          "items": "JUnit 5, Mockito, Testcontainers, WireMock, JaCoCo, k6"
        }
      ]
    },
    "fullstack": {
      "label": {
        "ru": "Fullstack",
        "en": "Fullstack"
      },
      "file": {
        "ru": "Дорохин_Игорь_Fullstack",
        "en": "Dorokhin_Igor_Fullstack"
      },
      "role": {
        "ru": "Middle Fullstack Developer · Java / Spring + React · AI / LLM",
        "en": "Middle Fullstack Developer · Java / Spring + React · AI / LLM"
      },
      "about": {
        "ru": [
          "Fullstack-разработчик с упором на backend: более 3 лет коммерческой разработки, из них 2,5 года на Java / Spring Boot, на фронтенде пишу на React. Работаю в InsurTech/FinTech над платформой актуарных расчётов и отчётности для НПФ, страховых компаний и банков. Обычно делаю фичу целиком: схема БД и миграции, REST/SSE API, интеграция через Kafka, затем React-интерфейс.",
          "Внедряю LLM в продукт: с нуля сделал RAG-ассистента по документации платформы на локальной модели, каждый день работаю с Claude Code. Занимаюсь и инфраструктурой: CI/CD в GitLab, Docker, мониторинг в Prometheus и Grafana."
        ],
        "en": [
          "Fullstack developer with a backend focus: 3+ years of commercial development, including 2.5 years of Java / Spring Boot, React on the frontend. I work in InsurTech/FinTech on a platform for actuarial calculations and reporting for pension funds, insurers and banks. I usually ship a feature end to end: database schema and migrations, REST/SSE API, Kafka integration, then the React UI.",
          "I bring LLMs into the product: built a RAG assistant for the platform documentation from scratch on a local model, and use Claude Code every day. I also handle infrastructure: GitLab CI/CD, Docker, monitoring with Prometheus and Grafana."
        ]
      },
      "jobs": [
        {
          "company": {
            "ru": "RTL Consulting (бывш. SAS Enterprise)",
            "en": "RTL Consulting (formerly SAS Enterprise)"
          },
          "period": {
            "ru": "Май 2024 — настоящее время",
            "en": "May 2024 — present"
          },
          "title": {
            "ru": "Fullstack / Backend Developer",
            "en": "Fullstack / Backend Developer"
          },
          "summary": {
            "ru": "Платформа актуарных расчётов и отчётности по МСФО 17 для НПФ, страховых компаний и банков. Таблицы, справочники и расчёты аналитики настраивают сами через интерфейс. Среди клиентов — СберНПФ, ВТБ, Газфонд ПН, Благосостояние и Ренессанс страхование. Backend: Java 17, Spring Boot 3, PostgreSQL, Kafka, Keycloak, MongoDB, Elasticsearch, Kubernetes. Frontend: React 18, MUI, Axios, Rsbuild.",
            "en": "Platform for actuarial calculations and IFRS 17 reporting for pension funds, insurers and banks. Analysts configure tables, reference lists and calculations themselves through the UI. Clients include SberNPF, VTB, Gazfond, Blagosostoyanie and Renaissance Insurance. Backend: Java 17, Spring Boot 3, PostgreSQL, Kafka, Keycloak, MongoDB, Elasticsearch, Kubernetes. Frontend: React 18, MUI, Axios, Rsbuild."
          },
          "groups": [
            {
              "title": {
                "ru": "Frontend (React)",
                "en": "Frontend (React)"
              },
              "items": {
                "ru": [
                  "Уведомления в реальном времени: SSE-эндпоинт на backend, колокольчик в шапке со счётчиком непрочитанных, одно SSE-соединение на вкладку, статус прочтения, сортировка и фильтры",
                  "Глобальный поиск в шапке: несколько режимов поиска, подгрузка результатов, подсветка совпадений. В админке — раздел настройки индексации сущностей в Elasticsearch",
                  "Переиспользуемый компонент serverTable с серверной пагинацией. На него переведены журнал аудита и вкладки CRM",
                  "Блок состояния сервисов (Kafka, Redis, Elasticsearch, сервис отчётов). Детали журнала аудита со скачиванием файлов и ссылками на связанные объекты"
                ],
                "en": [
                  "Real-time notifications: SSE endpoint on the backend, header bell with an unread counter, one SSE connection per tab, read status, sorting and filters",
                  "Global search in the header: several search modes, incremental loading, match highlighting; an admin section for configuring entity indexing in Elasticsearch",
                  "Reusable serverTable component with server-side pagination; the audit log and CRM tabs were migrated to it",
                  "Service health panel (Kafka, Redis, Elasticsearch, reporting service); audit log details with file downloads and links to related objects"
                ]
              }
            },
            {
              "title": {
                "ru": "Backend (Java / Spring)",
                "en": "Backend (Java / Spring)"
              },
              "items": {
                "ru": [
                  "Журнал аудита с нуля: модель событий, Spring AOP, фильтры и пагинация, потоковый экспорт CSV/XLSX, интеграция с SIEM. Затем вынес его в отдельный сервис событий с общей библиотекой на Kafka. При росте до миллионов записей перевёл его с PostgreSQL на ClickHouse, выборки ускорились в 3 раза",
                  "Цепочки расчётов в оркестраторе по графу зависимостей (DAG): параллельный запуск независимых калькуляторов, отмена, health-check и метрики Prometheus",
                  "Отчёты на JasperReports и Apache POI: доходность фондов относительно бенчмарка, графики, превью docx/pdf. Отчётные периоды с жизненным циклом статусов",
                  "Keycloak (OAuth2/OIDC), секреты в HashiCorp Vault, полное описание API в OpenAPI/Swagger"
                ],
                "en": [
                  "Audit log from scratch: event model, Spring AOP, filters and pagination, streaming CSV/XLSX export, SIEM integration; later moved it into a dedicated event service with a shared Kafka library. When the log grew to millions of records, moved its storage from PostgreSQL to ClickHouse, making queries about 3x faster",
                  "Calculation chains in the orchestrator driven by a dependency graph (DAG): parallel execution of independent calculators, cancellation, health checks and Prometheus metrics",
                  "Reports with JasperReports and Apache POI: fund performance against a benchmark, charts, docx/pdf previews; reporting periods with a status lifecycle",
                  "Keycloak (OAuth2/OIDC), secrets in HashiCorp Vault, full API documentation in OpenAPI/Swagger"
                ]
              }
            },
            {
              "title": {
                "ru": "AI Documentation Assistant (RAG)",
                "en": "AI Documentation Assistant (RAG)"
              },
              "items": {
                "ru": [
                  "С нуля сделал RAG-сервис, который отвечает на вопросы по инструкциям платформы: Python, FastAPI, LangChain, локальная LLM в Ollama, pgvector. Разбор docx и Markdown на блоки с картинками, ответы только по документам со ссылками на источники",
                  "Админка документов, развёртывание на GPU в Docker Compose, метрики токенов и времени ответа в Prometheus и Grafana, нагрузочные тесты на k6"
                ],
                "en": [
                  "Built a RAG service from scratch that answers questions about the platform manuals: Python, FastAPI, LangChain, a local LLM in Ollama, pgvector. Parsing docx and Markdown into blocks with images; answers strictly from the documents with source links",
                  "Document admin panel, GPU deployment in Docker Compose, token and latency metrics in Prometheus and Grafana, k6 load tests"
                ]
              }
            },
            {
              "title": {
                "ru": "DevOps & Monitoring",
                "en": "DevOps & Monitoring"
              },
              "items": {
                "ru": [
                  "CI/CD в GitLab CI: сборка, тесты, Docker-образы и автоматический деплой в Kubernetes. Docker Compose для сервисов и тестовых окружений",
                  "Метрики Micrometer / Prometheus, дашборды Grafana и алерты на недоступность сервисов и ошибки расчётов"
                ],
                "en": [
                  "GitLab CI/CD: build, tests, Docker images and automated deployment to Kubernetes; Docker Compose for services and test environments",
                  "Micrometer / Prometheus metrics, Grafana dashboards and alerts on service outages and calculation errors"
                ]
              }
            },
            {
              "title": {
                "ru": "Quality",
                "en": "Quality"
              },
              "items": {
                "ru": [
                  "Интеграционные тесты на Testcontainers и WireMock, их запуск в GitLab CI. Нагрузочные тесты на k6. Разделение монолита на микросервисы с переходом с Java 8 на Java 17"
                ],
                "en": [
                  "Integration tests with Testcontainers and WireMock running in GitLab CI; k6 load tests; split the monolith into microservices while moving from Java 8 to Java 17"
                ]
              }
            }
          ]
        },
        {
          "title": {
            "ru": "Fullstack Developer",
            "en": "Fullstack Developer"
          },
          "company": {
            "ru": "АО «ВНИИЖТ» (проектная работа)",
            "en": "VNIIZhT, railway transport research institute (project work)"
          },
          "period": {
            "ru": "2023 — 2024",
            "en": "2023 — 2024"
          },
          "summary": {
            "ru": "АО «ВНИИЖТ» — научно-исследовательский институт железнодорожного транспорта, разработчик АПК «ЭЛЬБРУС» для управления перевозками. Сделал базу знаний «вопрос — ответ» вместо переписки по почте: специалисты подтверждают ответы, пользователи находят решения сами. Вёл проект один, от проектирования до развёртывания.",
            "en": "VNIIZhT is the Russian railway transport research institute and the developer of ELBRUS, a suite for managing freight operations. Built a Q&A knowledge base for the institute to replace email support: specialists verify answers, users find solutions on their own. Ran the project solo, from design to deployment."
          },
          "groups": [
            {
              "title": {
                "ru": "Backend",
                "en": "Backend"
              },
              "items": {
                "ru": [
                  "Go (chi, pgx, миграции goose), PostgreSQL, MinIO: 34 REST-метода с документацией в Swagger, сессионная аутентификация и роли, голосование за ответы, вложения, email-уведомления, поиск с фильтрами, автоподбор тегов, импорт и экспорт",
                  "RAG-ассистент, который отвечает на вопросы пользователей на основе базы знаний"
                ],
                "en": [
                  "Go (chi, pgx, goose migrations), PostgreSQL, MinIO: 34 REST endpoints documented in Swagger, session authentication and roles, answer voting, attachments, email notifications, filtered search, automatic tagging, import and export",
                  "RAG assistant that answers user questions based on the knowledge base"
                ]
              }
            },
            {
              "title": {
                "ru": "Frontend",
                "en": "Frontend"
              },
              "items": {
                "ru": [
                  "React 19 и TypeScript (Vite, Tailwind): вопросы, ответы и комментарии, поиск, профиль, вложения"
                ],
                "en": [
                  "React 19 and TypeScript (Vite, Tailwind): questions, answers and comments, search, profile, attachments"
                ]
              }
            },
            {
              "title": {
                "ru": "DevOps & Security",
                "en": "DevOps & Security"
              },
              "items": {
                "ru": [
                  "CI/CD на GitHub Actions: сборка образа в GHCR и автодеплой; Docker Compose с Nginx, поставка в закрытую сеть без интернета. Нагрузочные тесты k6, проверка безопасности OWASP ZAP"
                ],
                "en": [
                  "GitHub Actions CI/CD: image build to GHCR and auto-deploy; Docker Compose with Nginx, delivery to an air-gapped network. k6 load tests, OWASP ZAP security scan"
                ]
              }
            }
          ]
        }
      ],
      "skills": [
        {
          "label": {
            "ru": "Frontend",
            "en": "Frontend"
          },
          "items": "JavaScript (ES2020+), React 18–19, TypeScript, MUI, Tailwind, Vite, Axios, SSE, HTML / CSS, Rsbuild, ESLint"
        },
        {
          "label": {
            "ru": "Backend",
            "en": "Backend"
          },
          "items": "Java 17+, Kotlin, Spring Boot 3, Spring Data JPA / Hibernate, Spring Security, Spring Cloud, Quarkus, REST, MapStruct, Go"
        },
        {
          "label": {
            "ru": "AI / LLM",
            "en": "AI / LLM"
          },
          "items": {
            "ru": "RAG, LangChain, Ollama, pgvector, эмбеддинги, промпт-инжиниринг, Claude Code, Python",
            "en": "RAG, LangChain, Ollama, pgvector, embeddings, prompt engineering, Claude Code, Python"
          }
        },
        {
          "label": {
            "ru": "Data",
            "en": "Data"
          },
          "items": "PostgreSQL, Liquibase, ClickHouse, MongoDB, Elasticsearch, Redis, S3/MinIO"
        },
        {
          "label": {
            "ru": "Infrastructure",
            "en": "Infrastructure"
          },
          "items": "Git, Gradle, Kafka, Keycloak, Vault, Docker / Compose, Kubernetes, Nginx, GitLab CI, GitHub Actions, Prometheus, Grafana, Linux"
        },
        {
          "label": {
            "ru": "Testing",
            "en": "Testing"
          },
          "items": "JUnit 5, Mockito, Testcontainers, WireMock, k6"
        }
      ]
    },
    "insurtech": {
      "label": {
        "ru": "InsurTech",
        "en": "InsurTech"
      },
      "file": {
        "ru": "Дорохин_Игорь_Java_InsurTech",
        "en": "Dorokhin_Igor_Java_InsurTech"
      },
      "role": {
        "ru": "Middle Java Developer · FinTech / InsurTech · AI / LLM",
        "en": "Middle Java Developer · FinTech / InsurTech · AI / LLM"
      },
      "about": {
        "ru": [
          "Более 3 лет в разработке, из них 2,5 года на Java / Spring Boot в финансовом секторе. Разрабатываю платформу актуарных расчётов и регуляторной отчётности для НПФ, страховых компаний и банков. Разбираюсь в предметной области: расчёты по МСФО 17, треугольники развития убытков, актуарные предположения, отчётные периоды и согласование, отчётность по доходности фондов.",
          "Внедряю LLM в продукт: с нуля сделал RAG-ассистента по документации платформы на локальной модели, каждый день работаю с Claude Code.",
          "Отвечаю за функции, которые важны для финансовых организаций: журнал аудита, интеграцию с SIEM, хранение секретов в Vault, разграничение доступа, а также надёжный запуск длительных расчётов, CI/CD и мониторинг."
        ],
        "en": [
          "3+ years in software development, including 2.5 years of Java / Spring Boot in the financial sector. I build a platform for actuarial calculations and regulatory reporting for pension funds, insurers and banks. I know the domain: IFRS 17 calculations, loss development triangles, actuarial assumptions, reporting periods and approvals, fund performance reporting.",
          "I bring LLMs into the product: built a RAG assistant for the platform documentation from scratch on a local model, and use Claude Code every day.",
          "I own features that matter to financial institutions: the audit log, SIEM integration, secrets in Vault, access control, plus reliable execution of long-running calculations, CI/CD and monitoring."
        ]
      },
      "jobs": [
        {
          "company": {
            "ru": "RTL Consulting (бывш. SAS Enterprise)",
            "en": "RTL Consulting (formerly SAS Enterprise)"
          },
          "period": {
            "ru": "Май 2024 — настоящее время",
            "en": "May 2024 — present"
          },
          "title": {
            "ru": "Java Backend Developer",
            "en": "Java Backend Developer"
          },
          "summary": {
            "ru": "Платформа актуарных расчётов для НПФ, страховых компаний и банков (продукты ПДС, ОПС, НПО). Среди клиентов — СберНПФ, ВТБ, Газфонд ПН, Благосостояние и Ренессанс страхование. Стек: Java 17, Spring Boot 3, PostgreSQL, Kafka, Keycloak, ClickHouse, MongoDB, Kubernetes.",
            "en": "Actuarial calculation platform for pension funds, insurers and banks (voluntary pension, mandatory pension and long-term savings products). Clients include SberNPF, VTB, Gazfond, Blagosostoyanie and Renaissance Insurance. Stack: Java 17, Spring Boot 3, PostgreSQL, Kafka, Keycloak, ClickHouse, MongoDB, Kubernetes."
          },
          "groups": [
            {
              "title": {
                "ru": "Actuarial Calculations & Reporting",
                "en": "Actuarial Calculations & Reporting"
              },
              "items": {
                "ru": [
                  "Цепочки расчётов (МСФО 17, формирование портфелей) по графу зависимостей (DAG): независимые калькуляторы запускаются параллельно, зависимые — когда готовы их входные данные. Отмена, итоговый статус, результаты прикрепляются к отчётным формам",
                  "Отчётные периоды и отчётные даты: генерация через очереди, жизненный цикл статусов, финальность, защита от дублей, блокировка повторного согласования",
                  "Треугольники развития убытков: вынес в отдельный сервис, написал алгоритм классификации, фильтрацию и разграничение доступа по ролям. Модель аллокации, доработки по актуарным предположениям",
                  "Отчёт по доходности фондов относительно бенчмарка с графиками (JasperReports, Apache POI), превью отчётов в docx/pdf, генерация кастомных таблиц"
                ],
                "en": [
                  "Calculation chains (IFRS 17, portfolio formation) driven by a dependency graph (DAG): independent calculators run in parallel, dependent ones start once their inputs are ready. Cancellation, final status, results attached to reporting forms",
                  "Reporting periods and dates: queue-based generation, status lifecycle, finality, duplicate protection, blocking repeated approval",
                  "Loss development triangles: moved into a separate service, wrote the classification algorithm, filtering and role-based access; allocation model, actuarial assumptions improvements",
                  "Fund performance report against a benchmark with charts (JasperReports, Apache POI), docx/pdf report previews, custom table generation"
                ]
              }
            },
            {
              "title": {
                "ru": "Audit & Security",
                "en": "Audit & Security"
              },
              "items": {
                "ru": [
                  "Журнал аудита всех действий пользователей и системы: AOP-аспекты, фильтрация, потоковый экспорт CSV/XLSX, политика хранения. Затем вынес его в отдельный сервис событий с общей библиотекой на Kafka. При росте до миллионов записей перевёл его с PostgreSQL на ClickHouse, выборки ускорились в 3 раза",
                  "Интеграция с SIEM: события безопасности, IP-адрес, сессии и неуспешные входы через Keycloak, админ-события (блокировка, смена пароля)",
                  "Секреты в HashiCorp Vault для 5 сервисов, ролевая модель с историей версий",
                  "Проверка безопасности по OWASP Top 10: сканирование OWASP ZAP, защита от SQL-инъекций в фильтрах и динамических запросах к БД"
                ],
                "en": [
                  "Audit log of all user and system actions: AOP aspects, filtering, streaming CSV/XLSX export, retention policy; later moved it into a dedicated event service with a shared Kafka library. When the log grew to millions of records, moved its storage from PostgreSQL to ClickHouse, making queries about 3x faster",
                  "SIEM integration: security events, IP address, Keycloak sessions and failed logins, admin events (lockouts, password changes)",
                  "Secrets in HashiCorp Vault for 5 services, role model with version history",
                  "Security checks against the OWASP Top 10: OWASP ZAP scans, SQL injection protection in filters and dynamic database queries"
                ]
              }
            },
            {
              "title": {
                "ru": "AI Documentation Assistant (RAG)",
                "en": "AI Documentation Assistant (RAG)"
              },
              "items": {
                "ru": [
                  "С нуля сделал RAG-сервис, который отвечает на вопросы по инструкциям платформы: Python, FastAPI, LangChain, локальная LLM в Ollama, pgvector. Разбор docx и Markdown на блоки с картинками, ответы только по документам со ссылками на источники",
                  "Админка документов, развёртывание на GPU в Docker Compose, метрики токенов и времени ответа в Prometheus и Grafana, нагрузочные тесты на k6"
                ],
                "en": [
                  "Built a RAG service from scratch that answers questions about the platform manuals: Python, FastAPI, LangChain, a local LLM in Ollama, pgvector. Parsing docx and Markdown into blocks with images; answers strictly from the documents with source links",
                  "Document admin panel, GPU deployment in Docker Compose, token and latency metrics in Prometheus and Grafana, k6 load tests"
                ]
              }
            },
            {
              "title": {
                "ru": "Integrations & Reliability",
                "en": "Integrations & Reliability"
              },
              "items": {
                "ru": [
                  "Подключения к внешним БД, включая ClickHouse, и выгрузка данных в них через Kafka. Перевёл сервис интеграций на Quarkus. Перенёс документы с глубоко вложенным JSON из PostgreSQL в MongoDB",
                  "Разделение монолита на микросервисы с переходом с Java 8 на Java 17",
                  "Health-check, метрики Prometheus, дашборды Grafana и алерты по калькуляторам и инфраструктуре",
                  "CI/CD в GitLab CI: тесты (Testcontainers, WireMock), Docker-образы и автоматический деплой в Kubernetes"
                ],
                "en": [
                  "Connections to external databases including ClickHouse, with data export to them over Kafka; migrated the integration service to Quarkus. Moved documents with deeply nested JSON from PostgreSQL to MongoDB",
                  "Split the monolith into microservices while moving from Java 8 to Java 17",
                  "Health checks, Prometheus metrics, Grafana dashboards and alerts for calculators and infrastructure",
                  "GitLab CI/CD: tests (Testcontainers, WireMock), Docker images and automated deployment to Kubernetes"
                ]
              }
            }
          ]
        },
        {
          "title": {
            "ru": "Fullstack Developer",
            "en": "Fullstack Developer"
          },
          "company": {
            "ru": "АО «ВНИИЖТ» (проектная работа)",
            "en": "VNIIZhT, railway transport research institute (project work)"
          },
          "period": {
            "ru": "2023 — 2024",
            "en": "2023 — 2024"
          },
          "summary": {
            "ru": "АО «ВНИИЖТ» — научно-исследовательский институт железнодорожного транспорта, разработчик АПК «ЭЛЬБРУС» для управления перевозками. Сделал базу знаний «вопрос — ответ» вместо переписки по почте: специалисты подтверждают ответы, пользователи находят решения сами. Вёл проект один, от проектирования до развёртывания.",
            "en": "VNIIZhT is the Russian railway transport research institute and the developer of ELBRUS, a suite for managing freight operations. Built a Q&A knowledge base for the institute to replace email support: specialists verify answers, users find solutions on their own. Ran the project solo, from design to deployment."
          },
          "groups": [
            {
              "title": {
                "ru": "Backend",
                "en": "Backend"
              },
              "items": {
                "ru": [
                  "Go (chi, pgx, миграции goose), PostgreSQL, MinIO: 34 REST-метода с документацией в Swagger, сессионная аутентификация и роли, голосование за ответы, вложения, email-уведомления, поиск с фильтрами, автоподбор тегов, импорт и экспорт",
                  "RAG-ассистент, который отвечает на вопросы пользователей на основе базы знаний"
                ],
                "en": [
                  "Go (chi, pgx, goose migrations), PostgreSQL, MinIO: 34 REST endpoints documented in Swagger, session authentication and roles, answer voting, attachments, email notifications, filtered search, automatic tagging, import and export",
                  "RAG assistant that answers user questions based on the knowledge base"
                ]
              }
            },
            {
              "title": {
                "ru": "Frontend",
                "en": "Frontend"
              },
              "items": {
                "ru": [
                  "React 19 и TypeScript (Vite, Tailwind): вопросы, ответы и комментарии, поиск, профиль, вложения"
                ],
                "en": [
                  "React 19 and TypeScript (Vite, Tailwind): questions, answers and comments, search, profile, attachments"
                ]
              }
            },
            {
              "title": {
                "ru": "DevOps & Security",
                "en": "DevOps & Security"
              },
              "items": {
                "ru": [
                  "CI/CD на GitHub Actions: сборка образа в GHCR и автодеплой; Docker Compose с Nginx, поставка в закрытую сеть без интернета. Нагрузочные тесты k6, проверка безопасности OWASP ZAP"
                ],
                "en": [
                  "GitHub Actions CI/CD: image build to GHCR and auto-deploy; Docker Compose with Nginx, delivery to an air-gapped network. k6 load tests, OWASP ZAP security scan"
                ]
              }
            }
          ]
        }
      ],
      "skills": [
        {
          "label": {
            "ru": "Backend",
            "en": "Backend"
          },
          "items": "Java 17+, Spring Boot 3, Spring Data JPA, Spring Security (OAuth2/OIDC), Spring AOP, Spring Cloud, Quarkus, Kotlin, Go"
        },
        {
          "label": {
            "ru": "AI / LLM",
            "en": "AI / LLM"
          },
          "items": {
            "ru": "RAG, LangChain, Ollama, pgvector, эмбеддинги, промпт-инжиниринг, Claude Code, Python",
            "en": "RAG, LangChain, Ollama, pgvector, embeddings, prompt engineering, Claude Code, Python"
          }
        },
        {
          "label": {
            "ru": "Data",
            "en": "Data"
          },
          "items": "PostgreSQL, SQL, Liquibase, ClickHouse, MongoDB, Elasticsearch, Redis, JasperReports, Apache POI"
        },
        {
          "label": {
            "ru": "Infrastructure",
            "en": "Infrastructure"
          },
          "items": "Git, Gradle, Kafka, Keycloak, HashiCorp Vault, SIEM, Docker, Kubernetes, GitLab CI, Prometheus, Grafana"
        },
        {
          "label": {
            "ru": "Testing",
            "en": "Testing"
          },
          "items": "JUnit 5, Mockito, Testcontainers, WireMock, k6"
        },
        {
          "label": {
            "ru": "Domain",
            "en": "Domain"
          },
          "items": {
            "ru": "МСФО 17, НПФ (ПДС / ОПС / НПО), треугольники развития убытков, отчётные периоды, аудит",
            "en": "IFRS 17, pension funds, loss development triangles, reporting periods, audit"
          }
        }
      ]
    }
  }
};
