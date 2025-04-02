const API_BASE_URL = 'http://localhost:1337/api';

// http://localhost:1337/api/courses?populate=Thumbnail
async function getCourses() {
    const response = await fetch(`${API_BASE_URL}/courses?populate=Thumbnail`);
    if (!response.ok) {
        console.log(response, "status");
        
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
}

async function getCourseDetail(id) {
    const response = await fetch(`${API_BASE_URL}/courses/${id}?populate=lessons`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
}

async function getLessonDetail(id) {
    const response = await fetch(`${API_BASE_URL}/lessons/${id}?populate=Sections`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
}

export { getCourses, getCourseDetail, getLessonDetail };