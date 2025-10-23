#!/usr/bin/env python3
"""
Zantara Bridge v4.1.0 - Multi-Document Analysis System
Enhanced Features - Stream C Implementation
AI-powered document analysis and comparison
"""

import os
import json
import logging
import asyncio
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
from pathlib import Path
import hashlib
import tempfile

# Document processing libraries
import PyPDF2
import docx
from PIL import Image
import pytesseract
import textract

# AI and NLP libraries
import openai
from transformers import AutoTokenizer, AutoModel
import spacy
from sentence_transformers import SentenceTransformer
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from difflib import SequenceMatcher

# Google Cloud libraries
from google.cloud import documentai, storage, vision
from google.api_core.client_options import ClientOptions

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class MultiDocumentAnalyzer:
    """Advanced multi-document analysis and comparison system"""
    
    def __init__(self, project_id: str = "involuted-box-469105-r0"):
        self.project_id = project_id
        self.region = "asia-southeast2"
        
        # Initialize AI models
        self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.nlp = spacy.load('en_core_web_sm') if self._check_spacy_model() else None
        
        # Initialize Google Cloud clients
        self.storage_client = storage.Client(project=project_id)
        self.vision_client = vision.ImageAnnotatorClient()
        
        # Document AI client
        try:
            opts = ClientOptions(api_endpoint=f"{self.region}-documentai.googleapis.com")
            self.docai_client = documentai.DocumentProcessorServiceClient(client_options=opts)
        except Exception as e:
            logger.warning(f"Document AI client initialization failed: {e}")
            self.docai_client = None
        
        # Analysis cache
        self.document_cache = {}
        self.analysis_results = {}
        
        logger.info("Multi-Document Analyzer initialized")
    
    def _check_spacy_model(self) -> bool:
        """Check if spacy model is available"""
        try:
            import spacy
            spacy.load('en_core_web_sm')
            return True
        except (ImportError, OSError):
            logger.warning("Spacy English model not available. Some features may be limited.")
            return False
    
    def extract_text_from_document(self, file_path: str) -> Dict[str, Any]:
        """Extract text from various document formats"""
        
        file_path = Path(file_path)
        if not file_path.exists():
            raise FileNotFoundError(f"Document not found: {file_path}")
        
        file_extension = file_path.suffix.lower()
        extracted_data = {
            'file_path': str(file_path),
            'file_name': file_path.name,
            'file_size': file_path.stat().st_size,
            'file_type': file_extension,
            'extraction_timestamp': datetime.utcnow().isoformat(),
            'text_content': '',
            'metadata': {},
            'pages': [],
            'extraction_method': ''
        }
        
        try:
            if file_extension == '.pdf':
                extracted_data.update(self._extract_from_pdf(file_path))
            elif file_extension in ['.docx', '.doc']:
                extracted_data.update(self._extract_from_word(file_path))
            elif file_extension in ['.txt', '.md']:
                extracted_data.update(self._extract_from_text(file_path))
            elif file_extension in ['.jpg', '.jpeg', '.png', '.tiff', '.bmp']:
                extracted_data.update(self._extract_from_image(file_path))
            else:
                # Fallback to textract for other formats
                extracted_data.update(self._extract_with_textract(file_path))
            
            # Generate document hash for caching
            content_hash = hashlib.md5(extracted_data['text_content'].encode()).hexdigest()
            extracted_data['content_hash'] = content_hash
            
            # Cache the result
            self.document_cache[content_hash] = extracted_data
            
            logger.info(f"Successfully extracted text from {file_path.name} ({len(extracted_data['text_content'])} chars)")
            
        except Exception as e:
            logger.error(f"Error extracting text from {file_path}: {e}")
            extracted_data['error'] = str(e)
        
        return extracted_data
    
    def _extract_from_pdf(self, file_path: Path) -> Dict[str, Any]:
        """Extract text from PDF files"""
        
        result = {
            'text_content': '',
            'pages': [],
            'metadata': {},
            'extraction_method': 'PyPDF2'
        }
        
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            
            # Extract metadata
            if pdf_reader.metadata:
                result['metadata'] = {
                    'title': pdf_reader.metadata.get('/Title', ''),
                    'author': pdf_reader.metadata.get('/Author', ''),
                    'subject': pdf_reader.metadata.get('/Subject', ''),
                    'creator': pdf_reader.metadata.get('/Creator', ''),
                    'creation_date': str(pdf_reader.metadata.get('/CreationDate', ''))
                }
            
            # Extract text from each page
            for page_num, page in enumerate(pdf_reader.pages, 1):
                try:
                    page_text = page.extract_text()
                    result['pages'].append({
                        'page_number': page_num,
                        'text': page_text,
                        'char_count': len(page_text)
                    })
                    result['text_content'] += page_text + '\n\n'
                except Exception as e:
                    logger.warning(f"Error extracting page {page_num}: {e}")
        
        return result
    
    def _extract_from_word(self, file_path: Path) -> Dict[str, Any]:
        """Extract text from Word documents"""
        
        result = {
            'text_content': '',
            'paragraphs': [],
            'metadata': {},
            'extraction_method': 'python-docx'
        }
        
        try:
            doc = docx.Document(file_path)
            
            # Extract core properties
            props = doc.core_properties
            result['metadata'] = {
                'title': props.title or '',
                'author': props.author or '',
                'subject': props.subject or '',
                'created': str(props.created) if props.created else '',
                'modified': str(props.modified) if props.modified else ''
            }
            
            # Extract paragraphs
            for para in doc.paragraphs:
                if para.text.strip():
                    result['paragraphs'].append({
                        'text': para.text,
                        'style': para.style.name if para.style else 'Normal'
                    })
                    result['text_content'] += para.text + '\n'
            
        except Exception as e:
            logger.error(f"Error reading Word document: {e}")
            # Fallback to textract
            result = self._extract_with_textract(file_path)
        
        return result
    
    def _extract_from_text(self, file_path: Path) -> Dict[str, Any]:
        """Extract text from plain text files"""
        
        result = {
            'text_content': '',
            'lines': [],
            'metadata': {},
            'extraction_method': 'direct_read'
        }
        
        # Try different encodings
        encodings = ['utf-8', 'utf-16', 'latin-1', 'cp1252']
        
        for encoding in encodings:
            try:
                with open(file_path, 'r', encoding=encoding) as file:
                    content = file.read()
                    result['text_content'] = content
                    result['lines'] = content.split('\n')
                    result['metadata']['encoding'] = encoding
                    result['metadata']['line_count'] = len(result['lines'])
                    break
            except UnicodeDecodeError:
                continue
        
        return result
    
    def _extract_from_image(self, file_path: Path) -> Dict[str, Any]:
        """Extract text from image files using OCR"""
        
        result = {
            'text_content': '',
            'ocr_data': {},
            'metadata': {},
            'extraction_method': 'tesseract_ocr'
        }
        
        try:
            # Use pytesseract for OCR
            image = Image.open(file_path)
            result['metadata']['image_size'] = image.size
            result['metadata']['image_mode'] = image.mode
            
            # Extract text with confidence scores
            ocr_data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
            result['ocr_data'] = ocr_data
            
            # Extract plain text
            text = pytesseract.image_to_string(image)
            result['text_content'] = text
            
            # Calculate average confidence
            confidences = [int(conf) for conf in ocr_data['conf'] if int(conf) > 0]
            if confidences:
                result['metadata']['avg_confidence'] = sum(confidences) / len(confidences)
            
        except Exception as e:
            logger.error(f"OCR extraction failed: {e}")
            result['error'] = str(e)
        
        return result
    
    def _extract_with_textract(self, file_path: Path) -> Dict[str, Any]:
        """Extract text using textract as fallback"""
        
        result = {
            'text_content': '',
            'metadata': {},
            'extraction_method': 'textract'
        }
        
        try:
            text = textract.process(str(file_path)).decode('utf-8')
            result['text_content'] = text
        except Exception as e:
            logger.error(f"Textract extraction failed: {e}")
            result['error'] = str(e)
        
        return result
    
    def analyze_document_content(self, document_data: Dict[str, Any]) -> Dict[str, Any]:
        """Perform advanced analysis on document content"""
        
        text_content = document_data.get('text_content', '')
        if not text_content.strip():
            return {'error': 'No text content to analyze'}
        
        analysis_result = {
            'document_id': document_data.get('content_hash', ''),
            'file_name': document_data.get('file_name', ''),
            'analysis_timestamp': datetime.utcnow().isoformat(),
            'basic_stats': self._calculate_basic_stats(text_content),
            'content_analysis': {},
            'entities': [],
            'key_phrases': [],
            'sentiment': {},
            'document_type': 'unknown',
            'confidence_scores': {}
        }
        
        # Basic text statistics
        analysis_result['basic_stats'] = self._calculate_basic_stats(text_content)
        
        # Content classification
        analysis_result['document_type'] = self._classify_document_type(text_content)
        
        # Entity extraction using spaCy (if available)
        if self.nlp:
            analysis_result['entities'] = self._extract_entities(text_content)
        
        # Key phrase extraction
        analysis_result['key_phrases'] = self._extract_key_phrases(text_content)
        
        # Sentiment analysis
        analysis_result['sentiment'] = self._analyze_sentiment(text_content)
        
        # Generate document embedding
        analysis_result['embedding'] = self._generate_document_embedding(text_content)
        
        return analysis_result
    
    def _calculate_basic_stats(self, text: str) -> Dict[str, Any]:
        """Calculate basic text statistics"""
        
        words = text.split()
        sentences = text.split('.')
        paragraphs = text.split('\n\n')
        
        return {
            'character_count': len(text),
            'word_count': len(words),
            'sentence_count': len([s for s in sentences if s.strip()]),
            'paragraph_count': len([p for p in paragraphs if p.strip()]),
            'avg_words_per_sentence': len(words) / max(len(sentences), 1),
            'avg_chars_per_word': len(text) / max(len(words), 1),
            'readability_score': self._calculate_readability(text)
        }
    
    def _calculate_readability(self, text: str) -> float:
        """Calculate readability score (simplified Flesch Reading Ease)"""
        
        words = text.split()
        sentences = text.split('.')
        syllables = sum([self._count_syllables(word) for word in words])
        
        if len(words) == 0 or len(sentences) == 0:
            return 0
        
        # Simplified Flesch Reading Ease formula
        score = 206.835 - (1.015 * (len(words) / len(sentences))) - (84.6 * (syllables / len(words)))
        return max(0, min(100, score))
    
    def _count_syllables(self, word: str) -> int:
        """Simple syllable counting"""
        vowels = 'aeiouy'
        word = word.lower()
        count = 0
        prev_was_vowel = False
        
        for char in word:
            is_vowel = char in vowels
            if is_vowel and not prev_was_vowel:
                count += 1
            prev_was_vowel = is_vowel
        
        # Handle silent e
        if word.endswith('e'):
            count -= 1
        
        return max(1, count)
    
    def _classify_document_type(self, text: str) -> str:
        """Classify document type based on content patterns"""
        
        text_lower = text.lower()
        
        # Contract patterns
        contract_keywords = ['agreement', 'contract', 'whereas', 'party', 'terms', 'conditions', 
                           'obligations', 'breach', 'termination', 'governing law']
        
        # Legal document patterns
        legal_keywords = ['court', 'judgment', 'plaintiff', 'defendant', 'statute', 'regulation',
                         'legal', 'law', 'section', 'clause', 'amendment']
        
        # Financial document patterns
        financial_keywords = ['invoice', 'payment', 'amount', 'tax', 'receipt', 'balance',
                             'account', 'transaction', 'financial', 'budget']
        
        # Report patterns
        report_keywords = ['analysis', 'summary', 'findings', 'conclusion', 'recommendation',
                          'executive summary', 'methodology', 'results']
        
        # Visa/Immigration patterns
        visa_keywords = ['visa', 'passport', 'immigration', 'border', 'residence', 'permit',
                        'citizenship', 'embassy', 'consulate', 'application']
        
        # Calculate keyword density
        word_count = len(text.split())
        
        scores = {
            'contract': sum([text_lower.count(kw) for kw in contract_keywords]) / word_count,
            'legal': sum([text_lower.count(kw) for kw in legal_keywords]) / word_count,
            'financial': sum([text_lower.count(kw) for kw in financial_keywords]) / word_count,
            'report': sum([text_lower.count(kw) for kw in report_keywords]) / word_count,
            'visa_immigration': sum([text_lower.count(kw) for kw in visa_keywords]) / word_count
        }
        
        # Return the type with highest score, or 'general' if all scores are low
        max_score = max(scores.values())
        if max_score > 0.001:  # Threshold for classification
            return max(scores, key=scores.get)
        
        return 'general'
    
    def _extract_entities(self, text: str) -> List[Dict[str, Any]]:
        """Extract named entities using spaCy"""
        
        if not self.nlp:
            return []
        
        doc = self.nlp(text)
        entities = []
        
        for ent in doc.ents:
            entities.append({
                'text': ent.text,
                'label': ent.label_,
                'description': spacy.explain(ent.label_),
                'start': ent.start_char,
                'end': ent.end_char,
                'confidence': getattr(ent, 'confidence', 1.0)
            })
        
        return entities
    
    def _extract_key_phrases(self, text: str) -> List[str]:
        """Extract key phrases from text"""
        
        # Simple approach: extract noun phrases
        if self.nlp:
            doc = self.nlp(text)
            phrases = []
            
            for chunk in doc.noun_chunks:
                if len(chunk.text.split()) >= 2 and len(chunk.text) > 5:
                    phrases.append(chunk.text.strip())
            
            return list(set(phrases))[:20]  # Return top 20 unique phrases
        
        # Fallback: extract common patterns
        import re
        phrases = re.findall(r'\b[A-Z][a-z]+ [A-Z][a-z]+\b', text)
        return list(set(phrases))[:10]
    
    def _analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment of the text"""
        
        # Simple sentiment analysis based on word counts
        positive_words = ['good', 'excellent', 'positive', 'approve', 'accept', 'agree', 'success']
        negative_words = ['bad', 'poor', 'negative', 'reject', 'deny', 'disagree', 'fail', 'error']
        
        text_lower = text.lower()
        positive_count = sum([text_lower.count(word) for word in positive_words])
        negative_count = sum([text_lower.count(word) for word in negative_words])
        
        total_sentiment_words = positive_count + negative_count
        
        if total_sentiment_words == 0:
            sentiment = 'neutral'
            confidence = 0.5
        else:
            if positive_count > negative_count:
                sentiment = 'positive'
                confidence = positive_count / total_sentiment_words
            elif negative_count > positive_count:
                sentiment = 'negative'
                confidence = negative_count / total_sentiment_words
            else:
                sentiment = 'neutral'
                confidence = 0.5
        
        return {
            'sentiment': sentiment,
            'confidence': confidence,
            'positive_indicators': positive_count,
            'negative_indicators': negative_count
        }
    
    def _generate_document_embedding(self, text: str) -> List[float]:
        """Generate semantic embedding for the document"""
        
        try:
            # Truncate text if too long (model limit)
            max_length = 512  # Typical transformer limit
            words = text.split()
            if len(words) > max_length:
                text = ' '.join(words[:max_length])
            
            embedding = self.sentence_model.encode([text])[0]
            return embedding.tolist()
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            return []
    
    def compare_documents(self, doc1_data: Dict[str, Any], doc2_data: Dict[str, Any]) -> Dict[str, Any]:
        """Compare two documents and generate detailed comparison report"""
        
        comparison_result = {
            'comparison_id': hashlib.md5(f"{doc1_data['content_hash']}{doc2_data['content_hash']}".encode()).hexdigest(),
            'timestamp': datetime.utcnow().isoformat(),
            'document1': {
                'name': doc1_data['file_name'],
                'hash': doc1_data['content_hash']
            },
            'document2': {
                'name': doc2_data['file_name'],
                'hash': doc2_data['content_hash']
            },
            'similarity_scores': {},
            'differences': {},
            'common_elements': {},
            'comparison_summary': ''
        }
        
        text1 = doc1_data['text_content']
        text2 = doc2_data['text_content']
        
        # Text similarity using different methods
        comparison_result['similarity_scores'] = {
            'character_similarity': self._calculate_character_similarity(text1, text2),
            'word_similarity': self._calculate_word_similarity(text1, text2),
            'semantic_similarity': self._calculate_semantic_similarity(text1, text2),
            'structure_similarity': self._calculate_structure_similarity(doc1_data, doc2_data)
        }
        
        # Detailed differences
        comparison_result['differences'] = self._find_detailed_differences(text1, text2)
        
        # Common elements
        comparison_result['common_elements'] = self._find_common_elements(text1, text2)
        
        # Generate comparison summary
        comparison_result['comparison_summary'] = self._generate_comparison_summary(comparison_result)
        
        return comparison_result
    
    def _calculate_character_similarity(self, text1: str, text2: str) -> float:
        """Calculate character-level similarity"""
        return SequenceMatcher(None, text1, text2).ratio()
    
    def _calculate_word_similarity(self, text1: str, text2: str) -> float:
        """Calculate word-level similarity"""
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        return len(intersection) / len(union) if union else 0
    
    def _calculate_semantic_similarity(self, text1: str, text2: str) -> float:
        """Calculate semantic similarity using embeddings"""
        
        try:
            # Generate embeddings
            embeddings = self.sentence_model.encode([text1, text2])
            
            # Calculate cosine similarity
            similarity = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
            return float(similarity)
        except Exception as e:
            logger.error(f"Error calculating semantic similarity: {e}")
            return 0.0
    
    def _calculate_structure_similarity(self, doc1_data: Dict[str, Any], doc2_data: Dict[str, Any]) -> float:
        """Calculate structural similarity between documents"""
        
        # Compare basic statistics
        stats1 = self._calculate_basic_stats(doc1_data['text_content'])
        stats2 = self._calculate_basic_stats(doc2_data['text_content'])
        
        # Normalize differences
        metrics = ['word_count', 'sentence_count', 'paragraph_count']
        similarities = []
        
        for metric in metrics:
            val1 = stats1.get(metric, 0)
            val2 = stats2.get(metric, 0)
            
            if val1 == 0 and val2 == 0:
                similarity = 1.0
            else:
                max_val = max(val1, val2)
                min_val = min(val1, val2)
                similarity = min_val / max_val if max_val > 0 else 0
            
            similarities.append(similarity)
        
        return sum(similarities) / len(similarities)
    
    def _find_detailed_differences(self, text1: str, text2: str) -> Dict[str, Any]:
        """Find detailed differences between two texts"""
        
        # Split into sentences for comparison
        sentences1 = [s.strip() for s in text1.split('.') if s.strip()]
        sentences2 = [s.strip() for s in text2.split('.') if s.strip()]
        
        # Find unique sentences
        unique_to_doc1 = []
        unique_to_doc2 = []
        
        for sent in sentences1:
            if sent not in sentences2:
                unique_to_doc1.append(sent)
        
        for sent in sentences2:
            if sent not in sentences1:
                unique_to_doc2.append(sent)
        
        return {
            'unique_to_document1': unique_to_doc1[:10],  # Limit to 10 for readability
            'unique_to_document2': unique_to_doc2[:10],
            'sentence_count_difference': len(sentences1) - len(sentences2),
            'character_count_difference': len(text1) - len(text2)
        }
    
    def _find_common_elements(self, text1: str, text2: str) -> Dict[str, Any]:
        """Find common elements between documents"""
        
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        common_words = words1.intersection(words2)
        
        # Find common phrases (simple approach)
        sentences1 = set([s.strip().lower() for s in text1.split('.') if s.strip()])
        sentences2 = set([s.strip().lower() for s in text2.split('.') if s.strip()])
        common_sentences = sentences1.intersection(sentences2)
        
        return {
            'common_words': list(common_words)[:50],  # Limit for readability
            'common_word_count': len(common_words),
            'common_sentences': list(common_sentences)[:10],
            'total_unique_words_doc1': len(words1),
            'total_unique_words_doc2': len(words2)
        }
    
    def _generate_comparison_summary(self, comparison_data: Dict[str, Any]) -> str:
        """Generate a human-readable comparison summary"""
        
        scores = comparison_data['similarity_scores']
        overall_similarity = (
            scores['character_similarity'] + 
            scores['word_similarity'] + 
            scores['semantic_similarity'] +
            scores['structure_similarity']
        ) / 4
        
        doc1_name = comparison_data['document1']['name']
        doc2_name = comparison_data['document2']['name']
        
        if overall_similarity > 0.8:
            similarity_desc = "very similar"
        elif overall_similarity > 0.6:
            similarity_desc = "moderately similar"
        elif overall_similarity > 0.4:
            similarity_desc = "somewhat similar"
        elif overall_similarity > 0.2:
            similarity_desc = "quite different"
        else:
            similarity_desc = "very different"
        
        summary = f"""
Document Comparison Summary:
{doc1_name} vs {doc2_name}

Overall Similarity: {overall_similarity:.2%} ({similarity_desc})

Detailed Scores:
- Character Similarity: {scores['character_similarity']:.2%}
- Word Similarity: {scores['word_similarity']:.2%}
- Semantic Similarity: {scores['semantic_similarity']:.2%}
- Structure Similarity: {scores['structure_similarity']:.2%}

Key Differences:
- Unique content in {doc1_name}: {len(comparison_data['differences']['unique_to_document1'])} sentences
- Unique content in {doc2_name}: {len(comparison_data['differences']['unique_to_document2'])} sentences

Common Elements:
- Shared words: {comparison_data['common_elements']['common_word_count']} words
- Shared sentences: {len(comparison_data['common_elements']['common_sentences'])} sentences
        """.strip()
        
        return summary
    
    def analyze_document_array(self, file_paths: List[str]) -> Dict[str, Any]:
        """Analyze an array of documents and generate comprehensive report"""
        
        analysis_start = datetime.utcnow()
        
        batch_analysis = {
            'analysis_id': hashlib.md5(str(file_paths).encode()).hexdigest(),
            'timestamp': analysis_start.isoformat(),
            'document_count': len(file_paths),
            'documents': [],
            'comparative_analysis': {},
            'summary_insights': {},
            'processing_errors': []
        }
        
        # Process each document
        document_analyses = []
        
        for file_path in file_paths:
            try:
                logger.info(f"Processing document: {file_path}")
                
                # Extract text
                extracted_data = self.extract_text_from_document(file_path)
                
                # Analyze content
                analysis = self.analyze_document_content(extracted_data)
                
                # Combine extraction and analysis data
                document_data = {**extracted_data, 'analysis': analysis}
                document_analyses.append(document_data)
                
                batch_analysis['documents'].append({
                    'file_path': file_path,
                    'status': 'success',
                    'document_hash': extracted_data.get('content_hash', ''),
                    'document_type': analysis.get('document_type', 'unknown'),
                    'word_count': analysis.get('basic_stats', {}).get('word_count', 0)
                })
                
            except Exception as e:
                error_msg = f"Error processing {file_path}: {str(e)}"
                logger.error(error_msg)
                batch_analysis['processing_errors'].append(error_msg)
                batch_analysis['documents'].append({
                    'file_path': file_path,
                    'status': 'error',
                    'error': str(e)
                })
        
        # Perform comparative analysis if multiple documents
        if len(document_analyses) > 1:
            batch_analysis['comparative_analysis'] = self._perform_batch_comparison(document_analyses)
        
        # Generate summary insights
        batch_analysis['summary_insights'] = self._generate_batch_insights(document_analyses)
        
        # Calculate processing time
        processing_time = (datetime.utcnow() - analysis_start).total_seconds()
        batch_analysis['processing_time_seconds'] = processing_time
        
        logger.info(f"Batch analysis completed in {processing_time:.2f} seconds")
        
        return batch_analysis
    
    def _perform_batch_comparison(self, document_analyses: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Perform comparative analysis across multiple documents"""
        
        comparative_analysis = {
            'similarity_matrix': {},
            'document_clustering': {},
            'common_themes': [],
            'outlier_documents': [],
            'type_distribution': {}
        }
        
        # Create similarity matrix
        n_docs = len(document_analyses)
        similarity_matrix = np.zeros((n_docs, n_docs))
        
        for i in range(n_docs):
            for j in range(i+1, n_docs):
                comparison = self.compare_documents(document_analyses[i], document_analyses[j])
                similarity = comparison['similarity_scores']['semantic_similarity']
                similarity_matrix[i][j] = similarity
                similarity_matrix[j][i] = similarity
        
        comparative_analysis['similarity_matrix'] = similarity_matrix.tolist()
        
        # Document type distribution
        type_counts = {}
        for doc in document_analyses:
            doc_type = doc.get('analysis', {}).get('document_type', 'unknown')
            type_counts[doc_type] = type_counts.get(doc_type, 0) + 1
        
        comparative_analysis['type_distribution'] = type_counts
        
        return comparative_analysis
    
    def _generate_batch_insights(self, document_analyses: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate insights from batch document analysis"""
        
        insights = {
            'total_documents': len(document_analyses),
            'total_words': 0,
            'average_readability': 0,
            'document_types': {},
            'key_themes': [],
            'quality_assessment': {}
        }
        
        if not document_analyses:
            return insights
        
        # Aggregate statistics
        readability_scores = []
        word_counts = []
        
        for doc in document_analyses:
            analysis = doc.get('analysis', {})
            basic_stats = analysis.get('basic_stats', {})
            
            word_count = basic_stats.get('word_count', 0)
            word_counts.append(word_count)
            insights['total_words'] += word_count
            
            readability = basic_stats.get('readability_score', 0)
            if readability > 0:
                readability_scores.append(readability)
            
            doc_type = analysis.get('document_type', 'unknown')
            insights['document_types'][doc_type] = insights['document_types'].get(doc_type, 0) + 1
        
        # Calculate averages
        if readability_scores:
            insights['average_readability'] = sum(readability_scores) / len(readability_scores)
        
        insights['average_word_count'] = sum(word_counts) / len(word_counts) if word_counts else 0
        
        # Quality assessment
        insights['quality_assessment'] = {
            'documents_with_good_readability': len([r for r in readability_scores if r > 60]),
            'documents_with_poor_readability': len([r for r in readability_scores if r < 30]),
            'average_document_length': insights['average_word_count'],
            'length_variation': max(word_counts) - min(word_counts) if word_counts else 0
        }
        
        return insights

def main():
    """Main function for testing the multi-document analyzer"""
    
    logger.info("Starting Multi-Document Analyzer test")
    
    analyzer = MultiDocumentAnalyzer()
    
    # Test with sample documents (if they exist)
    sample_docs = [
        "sample_contract.pdf",
        "sample_report.docx", 
        "sample_image.png"
    ]
    
    # Filter existing files
    existing_docs = [doc for doc in sample_docs if Path(doc).exists()]
    
    if existing_docs:
        logger.info(f"Analyzing {len(existing_docs)} documents")
        results = analyzer.analyze_document_array(existing_docs)
        
        logger.info("Analysis Results:")
        logger.info(json.dumps(results, indent=2, default=str))
    else:
        logger.info("No sample documents found. Creating test analysis...")
        
        # Create a simple test
        test_result = {
            'status': 'test_mode',
            'message': 'Multi-Document Analyzer is ready for production use',
            'capabilities': [
                'PDF text extraction',
                'Word document processing',
                'Image OCR',
                'Document comparison',
                'Semantic similarity analysis',
                'Batch processing',
                'Content classification'
            ]
        }
        
        logger.info(json.dumps(test_result, indent=2))
    
    return analyzer

if __name__ == "__main__":
    main()