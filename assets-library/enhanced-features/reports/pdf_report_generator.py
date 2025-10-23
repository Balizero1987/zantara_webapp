#!/usr/bin/env python3
"""
Zantara Bridge v4.1.0 - PDF Report Generator
Enhanced Features - Stream C Implementation
Professional PDF report generation for document analysis
"""

import os
import json
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
from pathlib import Path
import base64
import io

# PDF generation libraries
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, black, white, grey
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, Image, KeepTogether
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.graphics.shapes import Drawing, Rect, String
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics.charts.piecharts import Pie
from reportlab.graphics.charts.linecharts import HorizontalLineChart

# Data visualization
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import seaborn as sns
import numpy as np
import pandas as pd

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ZantaraPDFReportGenerator:
    """Professional PDF report generator for document analysis results"""
    
    def __init__(self):
        self.company_name = "Zantara Bridge"
        self.company_subtitle = "Advanced Document Analysis & Intelligence"
        self.version = "v4.1.0"
        
        # Colors scheme
        self.colors = {
            'primary': HexColor('#1a73e8'),      # Google Blue
            'secondary': HexColor('#34a853'),    # Google Green
            'accent': HexColor('#ff6d01'),       # Orange
            'warning': HexColor('#fbbc04'),      # Yellow
            'danger': HexColor('#ea4335'),       # Red
            'text_dark': HexColor('#202124'),    # Dark Grey
            'text_light': HexColor('#5f6368'),   # Light Grey
            'background': HexColor('#f8f9fa')    # Light Background
        }
        
        # Setup styles
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
        
        logger.info("PDF Report Generator initialized")
    
    def _setup_custom_styles(self):
        """Setup custom paragraph styles"""
        
        # Title styles
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Title'],
            fontSize=24,
            textColor=self.colors['primary'],
            alignment=TA_CENTER,
            spaceAfter=20
        ))
        
        # Subtitle
        self.styles.add(ParagraphStyle(
            name='CustomSubtitle',
            parent=self.styles['Normal'],
            fontSize=14,
            textColor=self.colors['text_light'],
            alignment=TA_CENTER,
            spaceAfter=30
        ))
        
        # Section headers
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading1'],
            fontSize=18,
            textColor=self.colors['primary'],
            spaceBefore=20,
            spaceAfter=12
        ))
        
        # Subsection headers
        self.styles.add(ParagraphStyle(
            name='SubsectionHeader',
            parent=self.styles['Heading2'],
            fontSize=14,
            textColor=self.colors['text_dark'],
            spaceBefore=15,
            spaceAfter=8
        ))
        
        # Highlighted text
        self.styles.add(ParagraphStyle(
            name='Highlight',
            parent=self.styles['Normal'],
            fontSize=12,
            textColor=self.colors['primary'],
            leftIndent=20
        ))
        
        # Code style
        self.styles.add(ParagraphStyle(
            name='Code',
            parent=self.styles['Normal'],
            fontSize=10,
            fontName='Courier',
            textColor=self.colors['text_dark'],
            backColor=self.colors['background'],
            leftIndent=20,
            rightIndent=20
        ))
    
    def generate_document_analysis_report(self, analysis_data: Dict[str, Any], output_path: str) -> str:
        """Generate a comprehensive PDF report for document analysis"""
        
        logger.info(f"Generating document analysis report: {output_path}")
        
        # Create document
        doc = SimpleDocTemplate(
            output_path,
            pagesize=A4,
            topMargin=1*inch,
            bottomMargin=1*inch,
            leftMargin=0.75*inch,
            rightMargin=0.75*inch
        )
        
        # Build story (content)
        story = []
        
        # Title page
        story.extend(self._create_title_page(analysis_data))
        story.append(PageBreak())
        
        # Executive summary
        story.extend(self._create_executive_summary(analysis_data))
        story.append(PageBreak())
        
        # Document details
        if 'documents' in analysis_data:
            story.extend(self._create_document_details_section(analysis_data))
            story.append(PageBreak())
        
        # Comparative analysis
        if 'comparative_analysis' in analysis_data:
            story.extend(self._create_comparative_analysis_section(analysis_data))
            story.append(PageBreak())
        
        # Insights and recommendations
        story.extend(self._create_insights_section(analysis_data))
        story.append(PageBreak())
        
        # Technical appendix
        story.extend(self._create_technical_appendix(analysis_data))
        
        # Build PDF
        doc.build(story)
        
        logger.info(f"PDF report generated successfully: {output_path}")
        return output_path
    
    def _create_title_page(self, analysis_data: Dict[str, Any]) -> List[Any]:
        """Create the title page"""
        
        elements = []
        
        # Company logo area (placeholder)
        elements.append(Spacer(1, 50))
        
        # Main title
        title = Paragraph(f"{self.company_name}", self.styles['CustomTitle'])
        elements.append(title)
        
        # Subtitle
        subtitle = Paragraph(self.company_subtitle, self.styles['CustomSubtitle'])
        elements.append(subtitle)
        
        elements.append(Spacer(1, 50))
        
        # Report title
        report_title = "Document Analysis Report"
        if 'document_count' in analysis_data:
            report_title += f" - {analysis_data['document_count']} Documents"
        
        elements.append(Paragraph(report_title, self.styles['SectionHeader']))
        
        elements.append(Spacer(1, 30))
        
        # Report metadata
        metadata_data = [
            ['Report ID:', analysis_data.get('analysis_id', 'N/A')],
            ['Generated:', datetime.utcnow().strftime('%B %d, %Y at %H:%M UTC')],
            ['System Version:', self.version],
            ['Document Count:', str(analysis_data.get('document_count', 0))],
            ['Processing Time:', f"{analysis_data.get('processing_time_seconds', 0):.2f} seconds"]
        ]
        
        metadata_table = Table(metadata_data, colWidths=[2*inch, 3*inch])
        metadata_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, self.colors['text_light'])
        ]))\n        \n        elements.append(metadata_table)\n        \n        elements.append(Spacer(1, 100))\n        \n        # Footer\n        footer_text = \"This report contains confidential analysis results generated by Zantara Bridge AI systems.\"\n        footer = Paragraph(footer_text, self.styles['Normal'])\n        elements.append(footer)\n        \n        return elements\n    \n    def _create_executive_summary(self, analysis_data: Dict[str, Any]) -> List[Any]:\n        \"\"\"Create executive summary section\"\"\"\n        \n        elements = []\n        \n        # Section header\n        elements.append(Paragraph(\"Executive Summary\", self.styles['SectionHeader']))\n        \n        # Generate summary based on analysis data\n        summary_insights = analysis_data.get('summary_insights', {})\n        \n        # Key metrics overview\n        elements.append(Paragraph(\"Key Metrics\", self.styles['SubsectionHeader']))\n        \n        metrics_data = [\n            ['Total Documents Processed', str(summary_insights.get('total_documents', 0))],\n            ['Total Words Analyzed', f\"{summary_insights.get('total_words', 0):,}\"],\n            ['Average Document Length', f\"{summary_insights.get('average_word_count', 0):.0f} words\"],\n            ['Average Readability Score', f\"{summary_insights.get('average_readability', 0):.1f}/100\"]\n        ]\n        \n        if analysis_data.get('processing_errors'):\n            metrics_data.append(['Processing Errors', str(len(analysis_data['processing_errors']))])\n        \n        metrics_table = Table(metrics_data, colWidths=[3*inch, 2*inch])\n        metrics_table.setStyle(TableStyle([\n            ('BACKGROUND', (0, 0), (-1, 0), self.colors['background']),\n            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),\n            ('FONTSIZE', (0, 0), (-1, -1), 11),\n            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),\n            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),\n            ('GRID', (0, 0), (-1, -1), 1, self.colors['text_light'])\n        ]))\n        \n        elements.append(metrics_table)\n        elements.append(Spacer(1, 20))\n        \n        # Document type distribution\n        if 'document_types' in summary_insights and summary_insights['document_types']:\n            elements.append(Paragraph(\"Document Type Distribution\", self.styles['SubsectionHeader']))\n            \n            type_data = [['Document Type', 'Count', 'Percentage']]\n            total_docs = summary_insights['total_documents']\n            \n            for doc_type, count in summary_insights['document_types'].items():\n                percentage = (count / total_docs * 100) if total_docs > 0 else 0\n                type_data.append([doc_type.title(), str(count), f\"{percentage:.1f}%\"])\n            \n            type_table = Table(type_data, colWidths=[2*inch, 1*inch, 1*inch])\n            type_table.setStyle(TableStyle([\n                ('BACKGROUND', (0, 0), (-1, 0), self.colors['primary']),\n                ('TEXTCOLOR', (0, 0), (-1, 0), white),\n                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),\n                ('FONTSIZE', (0, 0), (-1, -1), 10),\n                ('ALIGN', (1, 0), (-1, -1), 'CENTER'),\n                ('GRID', (0, 0), (-1, -1), 1, self.colors['text_light'])\n            ]))\n            \n            elements.append(type_table)\n            elements.append(Spacer(1, 20))\n        \n        # Quality assessment\n        quality_assessment = summary_insights.get('quality_assessment', {})\n        if quality_assessment:\n            elements.append(Paragraph(\"Quality Assessment\", self.styles['SubsectionHeader']))\n            \n            quality_text = f\"\"\"\n            Document quality analysis reveals:\n            \n            • {quality_assessment.get('documents_with_good_readability', 0)} documents have good readability (>60/100)\n            • {quality_assessment.get('documents_with_poor_readability', 0)} documents have poor readability (<30/100)\n            • Average document length: {quality_assessment.get('average_document_length', 0):.0f} words\n            • Length variation across documents: {quality_assessment.get('length_variation', 0):,} words\n            \"\"\"\n            \n            elements.append(Paragraph(quality_text, self.styles['Normal']))\n            elements.append(Spacer(1, 20))\n        \n        # Processing summary\n        elements.append(Paragraph(\"Processing Summary\", self.styles['SubsectionHeader']))\n        \n        processing_summary = f\"\"\"\n        Analysis completed successfully with the following results:\n        \n        • Processing time: {analysis_data.get('processing_time_seconds', 0):.2f} seconds\n        • Success rate: {((analysis_data.get('document_count', 0) - len(analysis_data.get('processing_errors', []))) / max(analysis_data.get('document_count', 1), 1) * 100):.1f}%\n        • Analysis timestamp: {analysis_data.get('timestamp', 'N/A')}\n        \"\"\"\n        \n        if analysis_data.get('processing_errors'):\n            processing_summary += f\"\\n• Errors encountered: {len(analysis_data['processing_errors'])} documents\"\n        \n        elements.append(Paragraph(processing_summary, self.styles['Normal']))\n        \n        return elements\n    \n    def _create_document_details_section(self, analysis_data: Dict[str, Any]) -> List[Any]:\n        \"\"\"Create detailed document analysis section\"\"\"\n        \n        elements = []\n        \n        elements.append(Paragraph(\"Document Analysis Details\", self.styles['SectionHeader']))\n        \n        documents = analysis_data.get('documents', [])\n        \n        for i, doc in enumerate(documents, 1):\n            if doc.get('status') != 'success':\n                continue\n                \n            elements.append(Paragraph(f\"Document {i}: {doc.get('file_path', 'Unknown')}\", self.styles['SubsectionHeader']))\n            \n            # Document metadata\n            doc_data = [\n                ['File Path', doc.get('file_path', 'N/A')],\n                ['Document Type', doc.get('document_type', 'Unknown').title()],\n                ['Word Count', f\"{doc.get('word_count', 0):,}\"],\n                ['Status', doc.get('status', 'Unknown').title()]\n            ]\n            \n            if 'document_hash' in doc:\n                doc_data.append(['Document Hash', doc['document_hash'][:16] + '...'])\n            \n            doc_table = Table(doc_data, colWidths=[2*inch, 3*inch])\n            doc_table.setStyle(TableStyle([\n                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),\n                ('FONTSIZE', (0, 0), (-1, -1), 10),\n                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),\n                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),\n                ('GRID', (0, 0), (-1, -1), 1, self.colors['text_light'])\n            ]))\n            \n            elements.append(doc_table)\n            elements.append(Spacer(1, 15))\n            \n            # Add page break after every 3 documents to avoid overcrowding\n            if i % 3 == 0 and i < len(documents):\n                elements.append(PageBreak())\n        \n        return elements\n    \n    def _create_comparative_analysis_section(self, analysis_data: Dict[str, Any]) -> List[Any]:\n        \"\"\"Create comparative analysis section\"\"\"\n        \n        elements = []\n        \n        elements.append(Paragraph(\"Comparative Analysis\", self.styles['SectionHeader']))\n        \n        comparative_data = analysis_data.get('comparative_analysis', {})\n        \n        # Document type distribution chart\n        if 'type_distribution' in comparative_data:\n            elements.append(Paragraph(\"Document Type Distribution\", self.styles['SubsectionHeader']))\n            \n            # Create pie chart\n            chart_path = self._create_pie_chart(\n                comparative_data['type_distribution'],\n                \"Document Types\",\n                \"doc_types_chart.png\"\n            )\n            \n            if chart_path:\n                img = Image(chart_path, width=4*inch, height=3*inch)\n                elements.append(img)\n                elements.append(Spacer(1, 20))\n                \n                # Clean up temporary file\n                try:\n                    os.unlink(chart_path)\n                except:\n                    pass\n        \n        # Similarity matrix\n        if 'similarity_matrix' in comparative_data:\n            elements.append(Paragraph(\"Document Similarity Analysis\", self.styles['SubsectionHeader']))\n            \n            similarity_matrix = comparative_data['similarity_matrix']\n            if similarity_matrix:\n                # Create heatmap\n                chart_path = self._create_similarity_heatmap(\n                    similarity_matrix,\n                    \"Document Similarity Matrix\",\n                    \"similarity_heatmap.png\"\n                )\n                \n                if chart_path:\n                    img = Image(chart_path, width=5*inch, height=4*inch)\n                    elements.append(img)\n                    elements.append(Spacer(1, 20))\n                    \n                    # Clean up temporary file\n                    try:\n                        os.unlink(chart_path)\n                    except:\n                        pass\n                \n                # Add interpretation\n                interpretation = \"\"\"\n                The similarity matrix above shows semantic similarity between documents on a scale of 0 to 1, \n                where 1 indicates identical content and 0 indicates completely different content. \n                Darker colors represent higher similarity.\n                \"\"\"\n                \n                elements.append(Paragraph(interpretation, self.styles['Normal']))\n        \n        return elements\n    \n    def _create_insights_section(self, analysis_data: Dict[str, Any]) -> List[Any]:\n        \"\"\"Create insights and recommendations section\"\"\"\n        \n        elements = []\n        \n        elements.append(Paragraph(\"Insights and Recommendations\", self.styles['SectionHeader']))\n        \n        # Key insights\n        elements.append(Paragraph(\"Key Insights\", self.styles['SubsectionHeader']))\n        \n        insights = self._generate_insights_from_data(analysis_data)\n        \n        for insight in insights:\n            bullet_point = f\"• {insight}\"\n            elements.append(Paragraph(bullet_point, self.styles['Normal']))\n        \n        elements.append(Spacer(1, 20))\n        \n        # Recommendations\n        elements.append(Paragraph(\"Recommendations\", self.styles['SubsectionHeader']))\n        \n        recommendations = self._generate_recommendations_from_data(analysis_data)\n        \n        for i, recommendation in enumerate(recommendations, 1):\n            rec_text = f\"{i}. {recommendation}\"\n            elements.append(Paragraph(rec_text, self.styles['Normal']))\n        \n        elements.append(Spacer(1, 20))\n        \n        # Next steps\n        elements.append(Paragraph(\"Suggested Next Steps\", self.styles['SubsectionHeader']))\n        \n        next_steps = [\n            \"Review identified discrepancies between similar documents\",\n            \"Implement document standardization for consistent formatting\",\n            \"Establish quality metrics for future document submissions\",\n            \"Consider automated document classification workflows\",\n            \"Set up regular document analysis reporting\"\n        ]\n        \n        for step in next_steps:\n            elements.append(Paragraph(f\"• {step}\", self.styles['Normal']))\n        \n        return elements\n    \n    def _create_technical_appendix(self, analysis_data: Dict[str, Any]) -> List[Any]:\n        \"\"\"Create technical appendix\"\"\"\n        \n        elements = []\n        \n        elements.append(Paragraph(\"Technical Appendix\", self.styles['SectionHeader']))\n        \n        # Analysis configuration\n        elements.append(Paragraph(\"Analysis Configuration\", self.styles['SubsectionHeader']))\n        \n        config_text = f\"\"\"\n        Analysis ID: {analysis_data.get('analysis_id', 'N/A')}\n        Timestamp: {analysis_data.get('timestamp', 'N/A')}\n        Processing Time: {analysis_data.get('processing_time_seconds', 0):.3f} seconds\n        Document Count: {analysis_data.get('document_count', 0)}\n        \n        System Information:\n        • Zantara Bridge Version: {self.version}\n        • Analysis Engine: Multi-Document Analyzer\n        • PDF Generation: ReportLab\n        • NLP Processing: spaCy + Transformers\n        \"\"\"\n        \n        elements.append(Paragraph(config_text, self.styles['Code']))\n        elements.append(Spacer(1, 20))\n        \n        # Processing errors\n        if analysis_data.get('processing_errors'):\n            elements.append(Paragraph(\"Processing Errors\", self.styles['SubsectionHeader']))\n            \n            for error in analysis_data['processing_errors']:\n                elements.append(Paragraph(f\"• {error}\", self.styles['Normal']))\n            \n            elements.append(Spacer(1, 20))\n        \n        # Raw data summary\n        elements.append(Paragraph(\"Raw Data Summary\", self.styles['SubsectionHeader']))\n        \n        # Truncated JSON for reference\n        raw_data_summary = {\n            'document_count': analysis_data.get('document_count'),\n            'processing_time_seconds': analysis_data.get('processing_time_seconds'),\n            'analysis_id': analysis_data.get('analysis_id'),\n            'timestamp': analysis_data.get('timestamp')\n        }\n        \n        json_text = json.dumps(raw_data_summary, indent=2)\n        elements.append(Paragraph(json_text, self.styles['Code']))\n        \n        return elements\n    \n    def _create_pie_chart(self, data: Dict[str, int], title: str, filename: str) -> Optional[str]:\n        \"\"\"Create a pie chart and return the file path\"\"\"\n        \n        try:\n            plt.figure(figsize=(6, 6))\n            \n            labels = list(data.keys())\n            sizes = list(data.values())\n            colors = plt.cm.Set3(np.linspace(0, 1, len(labels)))\n            \n            plt.pie(sizes, labels=labels, colors=colors, autopct='%1.1f%%', startangle=90)\n            plt.title(title, fontsize=14, fontweight='bold')\n            plt.axis('equal')\n            \n            # Save to temporary file\n            temp_path = f\"/tmp/{filename}\"\n            plt.savefig(temp_path, dpi=150, bbox_inches='tight')\n            plt.close()\n            \n            return temp_path\n            \n        except Exception as e:\n            logger.error(f\"Error creating pie chart: {e}\")\n            return None\n    \n    def _create_similarity_heatmap(self, matrix: List[List[float]], title: str, filename: str) -> Optional[str]:\n        \"\"\"Create a similarity heatmap and return the file path\"\"\"\n        \n        try:\n            plt.figure(figsize=(8, 6))\n            \n            # Convert to numpy array\n            np_matrix = np.array(matrix)\n            \n            # Create heatmap\n            sns.heatmap(np_matrix, annot=True, cmap='Blues', square=True, \n                       cbar_kws={'label': 'Similarity Score'})\n            \n            plt.title(title, fontsize=14, fontweight='bold')\n            plt.xlabel('Document Index')\n            plt.ylabel('Document Index')\n            \n            # Save to temporary file\n            temp_path = f\"/tmp/{filename}\"\n            plt.savefig(temp_path, dpi=150, bbox_inches='tight')\n            plt.close()\n            \n            return temp_path\n            \n        except Exception as e:\n            logger.error(f\"Error creating heatmap: {e}\")\n            return None\n    \n    def _generate_insights_from_data(self, analysis_data: Dict[str, Any]) -> List[str]:\n        \"\"\"Generate insights from analysis data\"\"\"\n        \n        insights = []\n        \n        summary_insights = analysis_data.get('summary_insights', {})\n        \n        # Document count insights\n        doc_count = summary_insights.get('total_documents', 0)\n        if doc_count > 1:\n            insights.append(f\"Analysis covered {doc_count} documents with comprehensive comparison\")\n        \n        # Word count insights\n        total_words = summary_insights.get('total_words', 0)\n        avg_words = summary_insights.get('average_word_count', 0)\n        if total_words > 0:\n            insights.append(f\"Total content analyzed: {total_words:,} words (average {avg_words:.0f} words per document)\")\n        \n        # Readability insights\n        avg_readability = summary_insights.get('average_readability', 0)\n        if avg_readability > 0:\n            if avg_readability > 70:\n                insights.append(f\"Documents demonstrate good readability (score: {avg_readability:.1f}/100)\")\n            elif avg_readability < 40:\n                insights.append(f\"Documents may benefit from readability improvements (score: {avg_readability:.1f}/100)\")\n            else:\n                insights.append(f\"Document readability is moderate (score: {avg_readability:.1f}/100)\")\n        \n        # Document type insights\n        doc_types = summary_insights.get('document_types', {})\n        if doc_types:\n            most_common_type = max(doc_types, key=doc_types.get)\n            insights.append(f\"Most common document type: {most_common_type.title()} ({doc_types[most_common_type]} documents)\")\n        \n        # Quality insights\n        quality_assessment = summary_insights.get('quality_assessment', {})\n        good_readability = quality_assessment.get('documents_with_good_readability', 0)\n        poor_readability = quality_assessment.get('documents_with_poor_readability', 0)\n        \n        if good_readability > poor_readability:\n            insights.append(f\"Majority of documents ({good_readability}) maintain good readability standards\")\n        elif poor_readability > 0:\n            insights.append(f\"{poor_readability} documents identified with readability concerns\")\n        \n        # Processing insights\n        errors = len(analysis_data.get('processing_errors', []))\n        if errors == 0:\n            insights.append(\"All documents processed successfully without errors\")\n        else:\n            insights.append(f\"{errors} documents encountered processing issues\")\n        \n        return insights\n    \n    def _generate_recommendations_from_data(self, analysis_data: Dict[str, Any]) -> List[str]:\n        \"\"\"Generate recommendations from analysis data\"\"\"\n        \n        recommendations = []\n        \n        summary_insights = analysis_data.get('summary_insights', {})\n        quality_assessment = summary_insights.get('quality_assessment', {})\n        \n        # Readability recommendations\n        poor_readability = quality_assessment.get('documents_with_poor_readability', 0)\n        if poor_readability > 0:\n            recommendations.append(f\"Review and improve readability for {poor_readability} documents with low scores\")\n        \n        # Length variation recommendations\n        length_variation = quality_assessment.get('length_variation', 0)\n        if length_variation > 10000:  # More than 10k word difference\n            recommendations.append(\"Consider establishing document length guidelines for consistency\")\n        \n        # Document type recommendations\n        doc_types = summary_insights.get('document_types', {})\n        if len(doc_types) > 3:\n            recommendations.append(\"Implement document classification system for better organization\")\n        \n        # Processing error recommendations\n        errors = analysis_data.get('processing_errors', [])\n        if errors:\n            recommendations.append(\"Address document format issues to improve processing success rate\")\n        \n        # Comparative analysis recommendations\n        if 'comparative_analysis' in analysis_data:\n            recommendations.append(\"Leverage similarity analysis for document standardization efforts\")\n        \n        # Default recommendations\n        if not recommendations:\n            recommendations = [\n                \"Maintain current document quality standards\",\n                \"Consider regular document analysis for continuous improvement\",\n                \"Implement document templates for consistency\"\n            ]\n        \n        return recommendations\n\ndef main():\n    \"\"\"Main function for testing PDF report generation\"\"\"\n    \n    logger.info(\"Testing PDF Report Generator\")\n    \n    generator = ZantaraPDFReportGenerator()\n    \n    # Sample analysis data\n    sample_data = {\n        'analysis_id': 'test_analysis_001',\n        'timestamp': datetime.utcnow().isoformat(),\n        'document_count': 3,\n        'processing_time_seconds': 45.67,\n        'documents': [\n            {\n                'file_path': 'contract_a.pdf',\n                'status': 'success',\n                'document_type': 'contract',\n                'word_count': 2500,\n                'document_hash': 'abc123def456'\n            },\n            {\n                'file_path': 'report_b.docx',\n                'status': 'success',\n                'document_type': 'report',\n                'word_count': 1800,\n                'document_hash': 'def456ghi789'\n            },\n            {\n                'file_path': 'financial_c.pdf',\n                'status': 'success',\n                'document_type': 'financial',\n                'word_count': 3200,\n                'document_hash': 'ghi789jkl012'\n            }\n        ],\n        'summary_insights': {\n            'total_documents': 3,\n            'total_words': 7500,\n            'average_word_count': 2500,\n            'average_readability': 65.5,\n            'document_types': {\n                'contract': 1,\n                'report': 1,\n                'financial': 1\n            },\n            'quality_assessment': {\n                'documents_with_good_readability': 2,\n                'documents_with_poor_readability': 1,\n                'average_document_length': 2500,\n                'length_variation': 1400\n            }\n        },\n        'comparative_analysis': {\n            'type_distribution': {\n                'contract': 1,\n                'report': 1,\n                'financial': 1\n            },\n            'similarity_matrix': [\n                [1.0, 0.3, 0.2],\n                [0.3, 1.0, 0.4],\n                [0.2, 0.4, 1.0]\n            ]\n        },\n        'processing_errors': []\n    }\n    \n    # Generate test report\n    output_path = \"test_document_analysis_report.pdf\"\n    \n    try:\n        result_path = generator.generate_document_analysis_report(sample_data, output_path)\n        logger.info(f\"Test report generated: {result_path}\")\n        return result_path\n    except Exception as e:\n        logger.error(f\"Error generating test report: {e}\")\n        return None\n\nif __name__ == \"__main__\":\n    main()"