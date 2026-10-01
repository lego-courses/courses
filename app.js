const DATA_URL = "courses.json";

const SITE_URL = "https://lego-courses.github.io/courses/";

let courses = [];
let settings = {};

document.addEventListener("DOMContentLoaded", async () => {

    const year = document.getElementById("year");

    if (year) {
        year.textContent = new Date().getFullYear();
    }

    try {

        const response = await fetch(DATA_URL, {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("courses.json could not be loaded");
        }

        const data = await response.json();

        courses = Array.isArray(data) ? data : data.courses || [];
        settings = Array.isArray(data) ? {} : data.settings || {};

        if (document.getElementById("coursesGrid")) {
            initHome();
        }

        if (document.getElementById("courseDetails")) {
            initCoursePage();
        }

    } catch (error) {

        console.error(error);

        const grid = document.getElementById("coursesGrid");

        if (grid) {
            grid.innerHTML = `
                <div class="error-box">
                    تعذر تحميل الكورسات.
                    تأكد من وجود ملف courses.json.
                </div>
            `;
        }

    }

});


function initHome() {

    renderBundle();

    renderCategories();

    renderCourses(courses);

    const search = document.getElementById("searchInput");
    const filter = document.getElementById("categoryFilter");

    search.addEventListener("input", filterCourses);
    filter.addEventListener("change", filterCourses);

}


function getCategories() {

    const categories = [];

    courses.forEach(course => {

        if (!Array.isArray(course.categories)) {
            return;
        }

        course.categories.forEach(category => {

            if (!categories.includes(category)) {
                categories.push(category);
            }

        });

    });

    return categories.sort((a, b) =>
        a.localeCompare(b, "ar")
    );

}


function renderCategories() {

    const categories = getCategories();

    const filter =
        document.getElementById("categoryFilter");

    const cards =
        document.getElementById("categoryCards");

    categories.forEach(category => {

        const option =
            document.createElement("option");

        option.value = category;
        option.textContent = category;

        filter.appendChild(option);


        const card =
            document.createElement("a");

        card.className = "category-card";

        const number =
            courses.filter(course =>
                course.categories &&
                course.categories.includes(category)
            ).length;

        card.innerHTML = `
            <span class="category-icon">⌁</span>

            <strong>
                ${escapeHTML(category)}
            </strong>

            <small>
                ${number} كورس
            </small>
        `;

        card.href = "#courses";

        card.addEventListener("click", () => {

            filter.value = category;

            const filtered =
                courses.filter(course =>
                    course.categories &&
                    course.categories.includes(category)
                );

            renderCourses(filtered);

        });

        cards.appendChild(card);

    });

}


function filterCourses() {

    const query =
        document
        .getElementById("searchInput")
        .value
        .trim()
        .toLowerCase();

    const category =
        document
        .getElementById("categoryFilter")
        .value;


    const filtered =
        courses.filter(course => {

            const searchable = [

                course.name,
                course.title,
                course.description,
                ...(course.categories || [])

            ]
            .join(" ")
            .toLowerCase();


            const matchesSearch =
                searchable.includes(query);


            const matchesCategory =
                !category ||
                (course.categories || [])
                .includes(category);


            return matchesSearch && matchesCategory;

        });


    renderCourses(filtered);

}


function renderCourses(list) {

    const grid =
        document.getElementById("coursesGrid");

    const count =
        document.getElementById("courseCount");

    const empty =
        document.getElementById("emptyState");


    grid.innerHTML = "";

    count.textContent =
        `${list.length} كورس`;

    empty.hidden =
        list.length !== 0;


    list.forEach(course => {

        const card =
            document.createElement("article");

        card.className =
            "course-card";


        const id =
            encodeURIComponent(course.id);


        const image =
            course.image ||
            "image/og.jpg";


        const price =
            Number(course.price) === 0
            ? "مجاني"
            : `${escapeHTML(course.price)} ${escapeHTML(course.currency || "جنيه")}`;


        card.innerHTML = `

            <a
                href="course.html?id=${id}"
                class="course-image"
            >

                <img
                    src="${escapeAttr(image)}"
                    alt="${escapeAttr(course.name)}"
                    loading="lazy"
                >

                <span class="course-size">
                    ${escapeHTML(course.size || "غير محدد")}
                </span>

            </a>


            <div class="course-body">


                <div class="tags">

                    ${(course.categories || [])
                    .slice(0, 3)
                    .map(category => `
                        <span>
                            ${escapeHTML(category)}
                        </span>
                    `)
                    .join("")}

                </div>


                <h3>

                    <a href="course.html?id=${id}">

                        ${escapeHTML(course.name)}

                    </a>

                </h3>


                <p>

                    ${escapeHTML(
                        course.title ||
                        course.description ||
                        ""
                    )}

                </p>


                <div class="price-row">

                    <span>السعر</span>

                    <strong>
                        ${price}
                    </strong>

                </div>


                <div class="card-footer">

                    <span>
                        ${escapeHTML(
                            course.format ||
                            "Course"
                        )}
                    </span>

                    <a
                        href="course.html?id=${id}"
                        class="details-link"
                    >
                        التفاصيل ←
                    </a>

                </div>


            </div>

        `;


        grid.appendChild(card);

    });

}


function renderBundle() {

    if (!settings.bundle) {
        return;
    }

    const bundle =
        settings.bundle;


    const name =
        document.getElementById("bundleName");

    const description =
        document.getElementById("bundleDescription");

    const price =
        document.getElementById("bundlePrice");

    const button =
        document.getElementById("bundleButton");


    if (name) {
        name.textContent =
            bundle.name ||
            "جميع الكورسات";
    }


    if (description) {
        description.textContent =
            bundle.description ||
            "";
    }


    if (price) {
        price.textContent =
            bundle.price || 0;
    }


    if (button) {

        button.href =
            bundle.subscribeUrl || "#";

    }

}


function initCoursePage() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const id =
        params.get("id");


    const course =
        courses.find(
            item => String(item.id) === String(id)
        );


    if (!course) {

        document.title =
            "الكورس غير موجود | كورسات الأمن السيبراني";


        document.getElementById(
            "courseDetails"
        ).innerHTML = `

            <div class="not-found">

                <h1>
                    الكورس غير موجود
                </h1>

                <p>
                    تأكد من رابط الكورس.
                </p>

                <a
                    href="index.html#courses"
                    class="btn primary"
                >
                    عرض الكورسات
                </a>

            </div>

        `;

        return;

    }


    const description =
        course.description ||
        course.title ||
        `${course.name} - كورس في الأمن السيبراني.`;


    const image =
        new URL(
            course.image || "image/og.jpg",
            window.location.href
        ).href;


    const canonical =
        `${SITE_URL}course.html?id=${encodeURIComponent(course.id)}`;


    document.title =
        `${course.name} | كورسات الأمن السيبراني`;


    document
        .getElementById("metaDescription")
        .setAttribute(
            "content",
            description
        );


    document
        .getElementById("canonical")
        .setAttribute(
            "href",
            canonical
        );


    document
        .getElementById("ogTitle")
        .setAttribute(
            "content",
            `${course.name} | كورسات الأمن السيبراني`
        );


    document
        .getElementById("ogDescription")
        .setAttribute(
            "content",
            description
        );


    document
        .getElementById("ogImage")
        .setAttribute(
            "content",
            image
        );


    document
        .getElementById("twitterTitle")
        .setAttribute(
            "content",
            `${course.name} | كورسات الأمن السيبراني`
        );


    document
        .getElementById("twitterDescription")
        .setAttribute(
            "content",
            description
        );


    document
        .getElementById("twitterImage")
        .setAttribute(
            "content",
            image
        );


    const schema = {

        "@context": "https://schema.org",

        "@type": "Course",

        "name": course.name,

        "description": description,

        "url": canonical,

        "image": image,

        "provider": {

            "@type": "Organization",

            "name":
                "كورسات الأمن السيبراني",

            "url":
                SITE_URL

        },

        "inLanguage": "ar"

    };


    document
        .getElementById("courseSchema")
        .textContent =
        JSON.stringify(schema);


    renderCourse(course);

}


function renderCourse(course) {

    const container =
        document.getElementById(
            "courseDetails"
        );


    const price =
        Number(course.price) === 0
        ? "مجاني"
        : `${escapeHTML(course.price)} ${escapeHTML(course.currency || "جنيه")}`;


    container.innerHTML = `

        <div class="course-head">


            <div class="course-cover">

                <img
                    src="${escapeAttr(
                        course.image ||
                        "image/og.jpg"
                    )}"
                    alt="${escapeAttr(
                        course.name
                    )}"
                >

            </div>


            <div class="course-head-content">


                <div class="tags">

                    ${(course.categories || [])
                    .map(category => `
                        <span>
                            ${escapeHTML(category)}
                        </span>
                    `)
                    .join("")}

                </div>


                <h1>
                    ${escapeHTML(course.name)}
                </h1>


                <h2>
                    ${escapeHTML(course.title || "")}
                </h2>


                <p>
                    ${escapeHTML(
                        course.description ||
                        ""
                    )}
                </p>


                <div class="course-meta">


                    <div>

                        <small>
                            السعر
                        </small>

                        <strong>
                            ${price}
                        </strong>

                    </div>


                    <div>

                        <small>
                            حجم الكورس
                        </small>

                        <strong>
                            ${escapeHTML(
                                course.size ||
                                "غير محدد"
                            )}
                        </strong>

                    </div>


                    <div>

                        <small>
                            النوع
                        </small>

                        <strong>
                            ${escapeHTML(
                                course.format ||
                                "Course"
                            )}
                        </strong>

                    </div>


                </div>


                <div class="hero-buttons">


                    <a
                        class="btn primary"
                        href="${escapeAttr(
                            course.subscribeUrl ||
                            "#"
                        )}"
                        target="_blank"
                        rel="nofollow noopener"
                    >
                        الاشتراك في الكورس
                    </a>


                    <a
                        class="btn secondary"
                        href="${escapeAttr(
                            course.courseUrl ||
                            "#"
                        )}"
                        target="_blank"
                        rel="nofollow noopener"
                    >
                        دخول الكورس
                    </a>


                </div>


            </div>

        </div>

    `;


    const article =
        document.getElementById(
            "courseArticle"
        );


    const benefits =
        Array.isArray(course.benefits)
        ? course.benefits
        : [];


    article.innerHTML = `

        <div class="article-box">


            <span class="section-kicker">
                COURSE INFORMATION
            </span>


            <h2>
                عن الكورس
            </h2>


            <p>
                ${escapeHTML(
                    course.description ||
                    ""
                )}
            </p>


            <h2>
                ماذا ستستفيد من الكورس؟
            </h2>


            <ul class="benefits">

                ${
                    benefits.length
                    ? benefits.map(item => `
                        <li>
                            ${escapeHTML(item)}
                        </li>
                    `).join("")
                    : `
                        <li>
                            راجع وصف الكورس لمعرفة المحتوى والفوائد.
                        </li>
                    `
                }

            </ul>


            <h2>
                مجالات الكورس
            </h2>


            <div class="detail-tags">

                ${(course.categories || [])
                .map(category => `
                    <span>
                        ${escapeHTML(category)}
                    </span>
                `)
                .join("")}

            </div>


            <div class="download-box">

                <div>

                    <strong>
                        ${escapeHTML(
                            course.name
                        )}
                    </strong>

                    <span>
                        الحجم:
                        ${escapeHTML(
                            course.size ||
                            "غير محدد"
                        )}
                    </span>

                </div>


                <a
                    class="btn primary"
                    href="${escapeAttr(
                        course.subscribeUrl ||
                        "#"
                    )}"
                    target="_blank"
                    rel="nofollow noopener"
                >
                    الاشتراك الآن
                </a>

            </div>


        </div>

    `;

}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/[&<>"']/g, char => ({

            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"

        }[char]));

}


function escapeAttr(value) {

    return escapeHTML(value);

}
