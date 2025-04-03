from flask import Flask, jsonify
import nltk
from transformers import pipeline
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer
from sklearn.feature_extraction.text import TfidfVectorizer
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow frontend requests

# Download necessary NLTK resources
nltk.download('stopwords')
nltk.download('punkt')

# Initialize Hugging Face summarizer
summarizer_hf = pipeline("summarization", model="facebook/bart-large-cnn")

def summarize_text_huggingface(text):
    max_input = 1024  
    if len(text.split()) > 400:  
        text = " ".join(text.split()[:400])  # Limit input size for summarization
    
    summary = summarizer_hf(text, max_length=150, min_length=50, do_sample=False)
    return summary[0]["summary_text"]

def summarize_text_sumy(text, sentence_count=3):
    parser = PlaintextParser.from_string(text, Tokenizer("english"))
    summarizer = LsaSummarizer()
    summary = summarizer(parser.document, sentence_count)
    return " ".join([str(sentence) for sentence in summary])

def extract_keywords_tfidf(text, num_keywords=5):
    vectorizer = TfidfVectorizer(stop_words="english")
    vectors = vectorizer.fit_transform([text])
    feature_names = vectorizer.get_feature_names_out()
    sorted_indices = vectors.toarray().argsort()[0][-num_keywords:][::-1]
    return [feature_names[i] for i in sorted_indices]

def generate_summary_and_keywords(text):
    sample_transcription = """
    Artificial Intelligence (AI) has become one of the most transformative technologies in the modern era. 
    It has applications in healthcare, finance, education, and even entertainment. Machine learning, 
    a subset of AI, enables systems to learn from data and make predictions. Companies like Google, 
    Amazon, and Microsoft are heavily investing in AI research. While AI offers numerous benefits, 
    it also raises concerns about job automation and ethical considerations. Governments and organizations 
    are actively working on policies to ensure AI development aligns with human values and ethics.
    """
    
    # Generate summaries
    summary_hf = summarize_text_huggingface(text)
    summary_sumy = summarize_text_sumy(text)
    
    # Extract keywords
    keywords_tfidf = extract_keywords_tfidf(text)

    return {
            "summary_huggingface": summary_hf,
            "summary_sumy": summary_sumy,
            "keywords_tfidf": keywords_tfidf
        }


if __name__ == "__main__":
    app.run(debug=True)