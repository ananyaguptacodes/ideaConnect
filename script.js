// Configuration
const SERVER_URL = "http://127.0.0.1:5501"; // Make sure this matches your backend server

// Global state
let currentUser = null;
let currentUserType = null;
let activeTab = "analyze-idea";
let publishedIdeas = [];
let investments = [];
let investors = [
  {
    id: 1,
    name: "Tech Ventures Inc.",
    focus: "Technology",
    email: "contact@techventures.com",
  },
  {
    id: 2,
    name: "Health Innovation Fund",
    focus: "Healthcare",
    email: "invest@healthfund.com",
  },
  {
    id: 3,
    name: "Green Capital",
    focus: "Environment",
    email: "green@capital.com",
  },
  {
    id: 4,
    name: "Startup Accelerator",
    focus: "All Industries",
    email: "hello@accelerator.com",
  },
];

// Sample ideas for demonstration
let sampleIdeas = [
  {
    id: 1,
    title: "AI-Powered Personal Health Assistant",
    category: "Healthcare",
    description:
      "A mobile app that uses AI to track health metrics and provide personalized health recommendations.",
    value: 250000,
    targetMarket: "Health-conscious individuals aged 25-55",
    creator: "John Doe",
    email: "john@example.com",
  },
  {
    id: 2,
    title: "Smart Home Energy Optimizer",
    category: "Technology",
    description:
      "IoT system that automatically optimizes home energy consumption to reduce bills and carbon footprint.",
    value: 500000,
    targetMarket: "Homeowners interested in sustainability",
    creator: "Jane Smith",
    email: "jane@example.com",
  },
];

// Authentication functions
function login(userType) {
  currentUserType = userType;
  document.getElementById("auth-section").style.display = "none";

  if (userType === "user") {
    document.getElementById("user-dashboard").classList.add("active");
    loadInvestors();
    loadUserIdeas();
  } else {
    document.getElementById("investor-dashboard").classList.add("active");
    loadIdeasForInvestors();
  }
}

function logout() {
  currentUser = null;
  currentUserType = null;
  document.getElementById("auth-section").style.display = "block";
  document.getElementById("user-dashboard").classList.remove("active");
  document.getElementById("investor-dashboard").classList.remove("active");
}

// Tab management
function showTab(tabName) {
  // Remove active class from all tabs and tab contents
  document
    .querySelectorAll(".tab")
    .forEach((tab) => tab.classList.remove("active"));
  document
    .querySelectorAll(".tab-content")
    .forEach((content) => content.classList.remove("active"));

  // Add active class to clicked tab and corresponding content
  event.target.classList.add("active");
  document.getElementById(tabName).classList.add("active");
  activeTab = tabName;
}

// Enhanced AI Chat functionality with backend integration
async function sendMessage() {
  const input = document.getElementById("chat-input");
  const sendBtn = document.getElementById("send-btn");
  const message = input.value.trim();

  if (!message) {
    showErrorMessage("Please enter a business idea to analyze.");
    return;
  }

  // Add user message to chat
  addChatMessage("user", message);
  input.value = "";

  // Disable button and show loading
  sendBtn.disabled = true;
  sendBtn.textContent = "Analyzing...";

  // Add loading indicator
  const loadingMessage = addChatMessage(
    "bot",
    `
                <div class="loading-indicator">
                    <div class="spinner"></div>
                    <span>Analyzing your business idea with AI...</span>
                </div>
            `
  );

  try {
    // Make API request to backend
    const response = await fetch(`${SERVER_URL}/suggest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idea: message }),
    });

    if (!response.ok) {
      let errorDetails = "";
      try {
        const errorData = await response.json();
        errorDetails = errorData.message || JSON.stringify(errorData);
      } catch (e) {
        errorDetails = await response.text();
      }
      throw new Error(
        `Analysis failed: ${response.status} ${response.statusText}. ${errorDetails}`
      );
    }

    const data = await response.json();

    // Remove loading message
    loadingMessage.remove();

    // Add AI response
    if (data.suggestion) {
      addChatMessage(
        "bot",
        `<strong>🤖 InvestiSight AI Analysis:</strong><br><br>${data.suggestion}`
      );
    } else {
      addChatMessage(
        "bot",
        "I received an empty analysis. Please try again with more details about your business idea."
      );
    }
  } catch (error) {
    console.error("AI Analysis Error:", error);

    // Remove loading message
    loadingMessage.remove();

    // Show error message
    addChatMessage(
      "bot",
      `
                    <div class="error-message">
                        <strong>⚠️ Analysis Error:</strong><br>
                        ${
                          error.message ||
                          "Unable to connect to AI analysis service. Please check if the backend server is running and try again."
                        }
                    </div>
                `
    );
  } finally {
    // Re-enable button
    sendBtn.disabled = false;
    sendBtn.textContent = "🔍 Analyze";
  }
}

function handleChatEnter(event) {
  if (event.key === "Enter") {
    sendMessage();
  }
}

function addChatMessage(sender, message) {
  const messagesContainer = document.getElementById("chat-messages");
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${sender}`;

  if (sender === "user") {
    messageDiv.innerHTML = `<strong>You:</strong> ${message}`;
  } else {
    messageDiv.innerHTML = message;
  }

  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  return messageDiv;
}

function showErrorMessage(message) {
  const messagesContainer = document.getElementById("chat-messages");
  const errorDiv = document.createElement("div");
  errorDiv.className = "message bot";
  errorDiv.innerHTML = `
                <div class="error-message">
                    <strong>⚠️ Error:</strong> ${message}
                </div>
            `;
  messagesContainer.appendChild(errorDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Idea publishing
function publishIdea(event) {
  event.preventDefault();

  const idea = {
    id: Date.now(),
    title: document.getElementById("idea-title").value,
    category: document.getElementById("idea-category").value,
    description: document.getElementById("idea-description").value,
    value: parseInt(document.getElementById("idea-value").value),
    targetMarket: document.getElementById("target-market").value,
    creator: "John Doe",
    email: "john@example.com",
  };

  publishedIdeas.push(idea);
  sampleIdeas.push(idea);

  // Clear form
  document.getElementById("idea-title").value = "";
  document.getElementById("idea-category").value = "";
  document.getElementById("idea-description").value = "";
  document.getElementById("idea-value").value = "";
  document.getElementById("target-market").value = "";

  alert("Idea published successfully! It will now be visible to investors.");
  loadUserIdeas();
}

// Load user's ideas
function loadUserIdeas() {
  const container = document.getElementById("user-ideas-list");
  container.innerHTML = "";

  publishedIdeas.forEach((idea) => {
    const ideaCard = createIdeaCard(idea, true);
    container.appendChild(ideaCard);
  });
}

// Load ideas for investors
function loadIdeasForInvestors() {
  const container = document.getElementById("ideas-list");
  container.innerHTML = "";

  sampleIdeas.forEach((idea) => {
    const ideaCard = createIdeaCard(idea, false);
    container.appendChild(ideaCard);
  });
}

// Create idea card
function createIdeaCard(idea, isOwner) {
  const card = document.createElement("div");
  card.className = "idea-card";

  card.innerHTML = `
                <div class="idea-title">${idea.title}</div>
                <div class="idea-category">${idea.category}</div>
                <div class="idea-value">Value: $${idea.value.toLocaleString()}</div>
                <p style="margin-bottom: 15px; color: #666;">${
                  idea.description
                }</p>
                <p style="margin-bottom: 15px; font-size: 0.9rem; color: #888;"><strong>Target Market:</strong> ${
                  idea.targetMarket
                }</p>
                ${
                  !isOwner
                    ? `<button class="contact-btn" onclick="contactCreator(${idea.id})">Contact Creator</button>`
                    : ""
                }
            `;

  return card;
}

// Load investors
function loadInvestors() {
  const container = document.getElementById("investors-list");
  container.innerHTML = "";

  investors.forEach((investor) => {
    const card = document.createElement("div");
    card.className = "investor-card";
    card.innerHTML = `
                    <h4>${investor.name}</h4>
                    <p><strong>Focus:</strong> ${investor.focus}</p>
                    <p>${investor.email}</p>
                    <button class="contact-btn" onclick="contactInvestor('${investor.email}')">Contact</button>
                `;
    container.appendChild(card);
  });
}

// Search functionality
function searchIdeas() {
  const searchTerm = document
    .getElementById("search-ideas")
    .value.toLowerCase();
  const container = document.getElementById("ideas-list");
  container.innerHTML = "";

  const filteredIdeas = sampleIdeas.filter(
    (idea) =>
      idea.title.toLowerCase().includes(searchTerm) ||
      idea.category.toLowerCase().includes(searchTerm) ||
      idea.description.toLowerCase().includes(searchTerm)
  );

  filteredIdeas.forEach((idea) => {
    const ideaCard = createIdeaCard(idea, false);
    container.appendChild(ideaCard);
  });
}

// Contact functions
function contactCreator(ideaId) {
  const idea = sampleIdeas.find((i) => i.id === ideaId);
  if (idea) {
    document.getElementById("contact-info").innerHTML = `
                    <p><strong>Idea:</strong> ${idea.title}</p>
                    <p><strong>Creator:</strong> ${idea.creator}</p>
                    <p><strong>Email:</strong> ${idea.email}</p>
                `;
    document.getElementById("contact-modal").style.display = "block";
  }
}

function contactInvestor(email) {
  alert(`Opening email client to contact: ${email}`);
}

function closeModal() {
  document.getElementById("contact-modal").style.display = "none";
}

function sendContactMessage(event) {
  event.preventDefault();
  const message = document.getElementById("contact-message").value;
  alert(
    "Message sent successfully! The creator will receive your contact information and message."
  );
  closeModal();
  document.getElementById("contact-message").value = "";
}

// Initialize the application
// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
  // Load sample data for demonstration
  loadInvestors();
  loadUserIdeas();
  loadIdeasForInvestors();

  // Set up event listeners
  document.getElementById("chat-input").focus();
});

// Enhanced AI response formatting
function formatAIResponse(text) {
  // Convert markdown-like formatting to HTML
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // bold
    .replace(/\*(.*?)\*/g, "<em>$1</em>") // italic
    .replace(/^#\s(.*$)/gm, "<h3>$1</h3>") // headings
    .replace(/^-\s(.*$)/gm, "<li>$1</li>") // list items
    .replace(/\n/g, "<br>"); // line breaks
}

// Investment tracking functions
function trackInvestment(ideaId) {
  const idea = sampleIdeas.find((i) => i.id === ideaId);
  if (idea) {
    investments.push({
      ideaId: idea.id,
      title: idea.title,
      amount: 0, // To be set by investor
      date: new Date().toISOString(),
      status: "pending",
    });
    alert(
      `You've expressed interest in "${idea.title}". The creator will contact you soon.`
    );
    loadInvestments();
  }
}

function loadInvestments() {
  const container = document.getElementById("investments-list");
  container.innerHTML = "";

  if (investments.length === 0) {
    container.innerHTML = "<p>You haven't made any investments yet.</p>";
    return;
  }

  investments.forEach((investment) => {
    const card = document.createElement("div");
    card.className = "idea-card";
    card.innerHTML = `
                    <div class="idea-title">${investment.title}</div>
                    <div class="idea-value">Status: ${investment.status}</div>
                    ${
                      investment.amount > 0
                        ? `<div>Amount: $${investment.amount.toLocaleString()}</div>`
                        : ""
                    }
                    <div>Date: ${new Date(
                      investment.date
                    ).toLocaleDateString()}</div>
                `;
    container.appendChild(card);
  });
}

// Notification system
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 5000);
}

// Data persistence (simulated)
function saveData() {
  // In a real app, this would save to localStorage or backend
  console.log("Data saved:", {
    publishedIdeas,
    investments,
    currentUserType,
  });
}

// Form validation helper
function validateForm(formId) {
  const form = document.getElementById(formId);
  const inputs = form.querySelectorAll(
    "input[required], textarea[required], select[required]"
  );
  let isValid = true;

  inputs.forEach((input) => {
    if (!input.value.trim()) {
      input.style.borderColor = "#dc3545";
      isValid = false;
    } else {
      input.style.borderColor = "#e1e5e9";
    }
  });

  return isValid;
}

// Initialize modals
function initModals() {
  // Close modal when clicking outside
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", function (e) {
      if (e.target === this) {
        this.style.display = "none";
      }
    });
  });
}

// Call initialization functions
initModals();
