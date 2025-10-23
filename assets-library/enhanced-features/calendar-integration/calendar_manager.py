#!/usr/bin/env python3
"""
Zantara Bridge v4.1.0 - Google Calendar Integration
Enhanced Features - Stream C Implementation
Automated visa/tax deadline management and reminders
"""

import os
import json
import logging
from datetime import datetime, timedelta, date
from typing import Dict, List, Any, Optional, Tuple
import pickle
from pathlib import Path

# Google Calendar API
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Date and time handling
import pytz
from dateutil.parser import parse as parse_date
from dateutil.relativedelta import relativedelta

# Email notifications
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ZantaraCalendarManager:
    """Google Calendar integration for visa/tax deadline management"""
    
    SCOPES = ['https://www.googleapis.com/auth/calendar']
    
    def __init__(self, credentials_file: str = 'credentials.json', token_file: str = 'token.pickle'):
        self.credentials_file = credentials_file
        self.token_file = token_file
        self.service = None
        self.calendar_id = 'primary'  # Default to primary calendar
        
        # Deadline categories
        self.deadline_categories = {
            'visa': {
                'color': '11',  # Red
                'reminders': [30, 14, 7, 3, 1],  # Days before
                'description_template': 'Visa deadline for {country} - {document_type}'
            },
            'tax': {
                'color': '9',   # Blue
                'reminders': [60, 30, 14, 7, 1],  # Days before
                'description_template': 'Tax deadline - {tax_type} for {jurisdiction}'
            },
            'permit': {
                'color': '5',   # Yellow
                'reminders': [21, 14, 7, 3],  # Days before
                'description_template': 'Permit deadline - {permit_type}'
            },
            'compliance': {
                'color': '6',   # Orange
                'reminders': [14, 7, 3, 1],  # Days before
                'description_template': 'Compliance deadline - {requirement_type}'
            }
        }
        
        # Initialize service
        self._authenticate()
        
        logger.info("Calendar Manager initialized")
    
    def _authenticate(self) -> None:
        """Authenticate with Google Calendar API"""
        
        creds = None
        
        # Load existing token
        if os.path.exists(self.token_file):
            with open(self.token_file, 'rb') as token:
                creds = pickle.load(token)
        
        # If no valid credentials, request authorization
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                try:
                    creds.refresh(Request())
                except Exception as e:
                    logger.warning(f"Token refresh failed: {e}")
                    creds = None
            
            if not creds:
                if not os.path.exists(self.credentials_file):
                    logger.error(f"Credentials file not found: {self.credentials_file}")
                    logger.info("Please download credentials from Google Cloud Console")
                    return
                
                flow = InstalledAppFlow.from_client_secrets_file(
                    self.credentials_file, self.SCOPES
                )
                creds = flow.run_local_server(port=0)
            
            # Save credentials for next run
            with open(self.token_file, 'wb') as token:
                pickle.dump(creds, token)
        
        try:
            self.service = build('calendar', 'v3', credentials=creds)
            logger.info("Google Calendar API authenticated successfully")
        except Exception as e:
            logger.error(f"Failed to build Calendar service: {e}")
    
    def create_deadline_event(self, 
                            title: str,
                            deadline_date: datetime,
                            category: str = 'compliance',
                            description: str = '',
                            location: str = '',
                            metadata: Dict[str, Any] = None) -> Optional[str]:
        """Create a deadline event with automatic reminders"""
        
        if not self.service:
            logger.error("Calendar service not initialized")
            return None
        
        if category not in self.deadline_categories:
            logger.warning(f"Unknown category: {category}. Using 'compliance'")
            category = 'compliance'
        
        category_config = self.deadline_categories[category]
        
        # Ensure deadline_date is timezone-aware
        if deadline_date.tzinfo is None:
            deadline_date = pytz.timezone('UTC').localize(deadline_date)
        
        # Create main event\n        event = {\n            'summary': title,\n            'description': description,\n            'location': location,\n            'start': {\n                'dateTime': deadline_date.isoformat(),\n                'timeZone': str(deadline_date.tzinfo),\n            },\n            'end': {\n                'dateTime': (deadline_date + timedelta(hours=1)).isoformat(),\n                'timeZone': str(deadline_date.tzinfo),\n            },\n            'colorId': category_config['color'],\n            'reminders': {\n                'useDefault': False,\n                'overrides': [\n                    {'method': 'email', 'minutes': 24 * 60},  # 1 day\n                    {'method': 'popup', 'minutes': 60},        # 1 hour\n                ],\n            },\n        }\n        \n        # Add metadata as extended properties\n        if metadata:\n            event['extendedProperties'] = {\n                'private': {\n                    'category': category,\n                    'created_by': 'zantara_bridge',\n                    **{k: str(v) for k, v in metadata.items()}\n                }\n            }\n        \n        try:\n            created_event = self.service.events().insert(\n                calendarId=self.calendar_id,\n                body=event\n            ).execute()\n            \n            event_id = created_event['id']\n            logger.info(f\"Created deadline event: {title} (ID: {event_id})\")\n            \n            # Create reminder events\n            self._create_reminder_events(title, deadline_date, category, event_id, metadata)\n            \n            return event_id\n            \n        except HttpError as e:\n            logger.error(f\"Error creating event: {e}\")\n            return None\n    \n    def _create_reminder_events(self, \n                               title: str, \n                               deadline_date: datetime,\n                               category: str,\n                               main_event_id: str,\n                               metadata: Dict[str, Any] = None) -> List[str]:\n        \"\"\"Create reminder events leading up to the deadline\"\"\"\n        \n        category_config = self.deadline_categories[category]\n        reminder_days = category_config['reminders']\n        \n        reminder_event_ids = []\n        \n        for days_before in reminder_days:\n            reminder_date = deadline_date - timedelta(days=days_before)\n            \n            # Skip if reminder date is in the past\n            if reminder_date < datetime.now(deadline_date.tzinfo):\n                continue\n            \n            reminder_title = f\"REMINDER: {title} (in {days_before} days)\"\n            reminder_description = f\"\"\"\n            Upcoming deadline reminder:\n            \n            Deadline: {title}\n            Due Date: {deadline_date.strftime('%B %d, %Y at %H:%M')}\n            Days Remaining: {days_before}\n            Category: {category.title()}\n            \n            Please ensure all requirements are met before the deadline.\n            \n            Related Event ID: {main_event_id}\n            \"\"\"\n            \n            reminder_event = {\n                'summary': reminder_title,\n                'description': reminder_description,\n                'start': {\n                    'dateTime': reminder_date.isoformat(),\n                    'timeZone': str(reminder_date.tzinfo),\n                },\n                'end': {\n                    'dateTime': (reminder_date + timedelta(minutes=30)).isoformat(),\n                    'timeZone': str(reminder_date.tzinfo),\n                },\n                'colorId': '2',  # Green for reminders\n                'reminders': {\n                    'useDefault': False,\n                    'overrides': [\n                        {'method': 'email', 'minutes': 0},\n                        {'method': 'popup', 'minutes': 0},\n                    ],\n                },\n                'extendedProperties': {\n                    'private': {\n                        'type': 'deadline_reminder',\n                        'category': category,\n                        'main_event_id': main_event_id,\n                        'days_before': str(days_before),\n                        'created_by': 'zantara_bridge'\n                    }\n                }\n            }\n            \n            try:\n                created_reminder = self.service.events().insert(\n                    calendarId=self.calendar_id,\n                    body=reminder_event\n                ).execute()\n                \n                reminder_event_ids.append(created_reminder['id'])\n                logger.info(f\"Created reminder: {days_before} days before {title}\")\n                \n            except HttpError as e:\n                logger.error(f\"Error creating reminder event: {e}\")\n        \n        return reminder_event_ids\n    \n    def create_visa_deadline(self,\n                           country: str,\n                           document_type: str,\n                           deadline_date: datetime,\n                           applicant_name: str = '',\n                           passport_number: str = '',\n                           additional_notes: str = '') -> Optional[str]:\n        \"\"\"Create a visa-specific deadline event\"\"\"\n        \n        title = f\"Visa Deadline - {country} ({document_type})\"\n        \n        description = f\"\"\"\n        Visa Application Deadline\n        \n        Country: {country}\n        Document Type: {document_type}\n        Applicant: {applicant_name}\n        Passport Number: {passport_number}\n        \n        Important: Ensure all required documents are prepared and submitted before this deadline.\n        \n        Additional Notes:\n        {additional_notes}\n        \n        Generated by Zantara Bridge Compliance System\n        \"\"\"\n        \n        metadata = {\n            'country': country,\n            'document_type': document_type,\n            'applicant_name': applicant_name,\n            'passport_number': passport_number,\n            'deadline_type': 'visa'\n        }\n        \n        return self.create_deadline_event(\n            title=title,\n            deadline_date=deadline_date,\n            category='visa',\n            description=description,\n            metadata=metadata\n        )\n    \n    def create_tax_deadline(self,\n                          tax_type: str,\n                          jurisdiction: str,\n                          deadline_date: datetime,\n                          tax_year: str = '',\n                          estimated_amount: str = '',\n                          additional_notes: str = '') -> Optional[str]:\n        \"\"\"Create a tax-specific deadline event\"\"\"\n        \n        title = f\"Tax Deadline - {tax_type} ({jurisdiction})\"\n        \n        description = f\"\"\"\n        Tax Filing/Payment Deadline\n        \n        Tax Type: {tax_type}\n        Jurisdiction: {jurisdiction}\n        Tax Year: {tax_year}\n        Estimated Amount: {estimated_amount}\n        \n        Important: Ensure all tax obligations are met before this deadline to avoid penalties.\n        \n        Additional Notes:\n        {additional_notes}\n        \n        Generated by Zantara Bridge Compliance System\n        \"\"\"\n        \n        metadata = {\n            'tax_type': tax_type,\n            'jurisdiction': jurisdiction,\n            'tax_year': tax_year,\n            'estimated_amount': estimated_amount,\n            'deadline_type': 'tax'\n        }\n        \n        return self.create_deadline_event(\n            title=title,\n            deadline_date=deadline_date,\n            category='tax',\n            description=description,\n            metadata=metadata\n        )\n    \n    def get_upcoming_deadlines(self, days_ahead: int = 30) -> List[Dict[str, Any]]:\n        \"\"\"Get upcoming deadlines within specified days\"\"\"\n        \n        if not self.service:\n            logger.error(\"Calendar service not initialized\")\n            return []\n        \n        # Calculate time range\n        now = datetime.utcnow()\n        time_max = now + timedelta(days=days_ahead)\n        \n        try:\n            events_result = self.service.events().list(\n                calendarId=self.calendar_id,\n                timeMin=now.isoformat() + 'Z',\n                timeMax=time_max.isoformat() + 'Z',\n                singleEvents=True,\n                orderBy='startTime',\n                q='zantara_bridge'  # Filter for our events\n            ).execute()\n            \n            events = events_result.get('items', [])\n            \n            deadlines = []\n            for event in events:\n                # Skip reminder events\n                ext_props = event.get('extendedProperties', {}).get('private', {})\n                if ext_props.get('type') == 'deadline_reminder':\n                    continue\n                \n                # Parse deadline information\n                start_time = event['start'].get('dateTime', event['start'].get('date'))\n                deadline_date = parse_date(start_time)\n                \n                days_until = (deadline_date.replace(tzinfo=None) - now).days\n                \n                deadline_info = {\n                    'event_id': event['id'],\n                    'title': event['summary'],\n                    'description': event.get('description', ''),\n                    'deadline_date': deadline_date,\n                    'days_until': days_until,\n                    'category': ext_props.get('category', 'unknown'),\n                    'metadata': {k: v for k, v in ext_props.items() if k not in ['category', 'created_by']}\n                }\n                \n                deadlines.append(deadline_info)\n            \n            logger.info(f\"Found {len(deadlines)} upcoming deadlines\")\n            return deadlines\n            \n        except HttpError as e:\n            logger.error(f\"Error retrieving events: {e}\")\n            return []\n    \n    def update_deadline(self, event_id: str, updates: Dict[str, Any]) -> bool:\n        \"\"\"Update an existing deadline event\"\"\"\n        \n        if not self.service:\n            logger.error(\"Calendar service not initialized\")\n            return False\n        \n        try:\n            # Get existing event\n            event = self.service.events().get(\n                calendarId=self.calendar_id,\n                eventId=event_id\n            ).execute()\n            \n            # Apply updates\n            if 'title' in updates:\n                event['summary'] = updates['title']\n            \n            if 'description' in updates:\n                event['description'] = updates['description']\n            \n            if 'deadline_date' in updates:\n                new_deadline = updates['deadline_date']\n                if new_deadline.tzinfo is None:\n                    new_deadline = pytz.timezone('UTC').localize(new_deadline)\n                \n                event['start']['dateTime'] = new_deadline.isoformat()\n                event['end']['dateTime'] = (new_deadline + timedelta(hours=1)).isoformat()\n            \n            if 'metadata' in updates:\n                ext_props = event.get('extendedProperties', {}).get('private', {})\n                ext_props.update({k: str(v) for k, v in updates['metadata'].items()})\n                event['extendedProperties'] = {'private': ext_props}\n            \n            # Update event\n            updated_event = self.service.events().update(\n                calendarId=self.calendar_id,\n                eventId=event_id,\n                body=event\n            ).execute()\n            \n            logger.info(f\"Updated deadline event: {event_id}\")\n            return True\n            \n        except HttpError as e:\n            logger.error(f\"Error updating event: {e}\")\n            return False\n    \n    def delete_deadline(self, event_id: str, delete_reminders: bool = True) -> bool:\n        \"\"\"Delete a deadline event and optionally its reminders\"\"\"\n        \n        if not self.service:\n            logger.error(\"Calendar service not initialized\")\n            return False\n        \n        try:\n            # Delete main event\n            self.service.events().delete(\n                calendarId=self.calendar_id,\n                eventId=event_id\n            ).execute()\n            \n            logger.info(f\"Deleted deadline event: {event_id}\")\n            \n            # Delete associated reminder events\n            if delete_reminders:\n                self._delete_reminder_events(event_id)\n            \n            return True\n            \n        except HttpError as e:\n            logger.error(f\"Error deleting event: {e}\")\n            return False\n    \n    def _delete_reminder_events(self, main_event_id: str) -> None:\n        \"\"\"Delete all reminder events associated with a main deadline event\"\"\"\n        \n        try:\n            # Search for reminder events\n            events_result = self.service.events().list(\n                calendarId=self.calendar_id,\n                q=f'zantara_bridge {main_event_id}'\n            ).execute()\n            \n            events = events_result.get('items', [])\n            \n            for event in events:\n                ext_props = event.get('extendedProperties', {}).get('private', {})\n                if (ext_props.get('type') == 'deadline_reminder' and \n                    ext_props.get('main_event_id') == main_event_id):\n                    \n                    self.service.events().delete(\n                        calendarId=self.calendar_id,\n                        eventId=event['id']\n                    ).execute()\n                    \n                    logger.info(f\"Deleted reminder event: {event['id']}\")\n                    \n        except HttpError as e:\n            logger.error(f\"Error deleting reminder events: {e}\")\n    \n    def generate_deadline_report(self, days_ahead: int = 90) -> Dict[str, Any]:\n        \"\"\"Generate a comprehensive report of upcoming deadlines\"\"\"\n        \n        deadlines = self.get_upcoming_deadlines(days_ahead)\n        \n        report = {\n            'report_date': datetime.utcnow().isoformat(),\n            'report_period_days': days_ahead,\n            'total_deadlines': len(deadlines),\n            'deadlines_by_category': {},\n            'deadlines_by_urgency': {\n                'critical': [],    # <= 7 days\n                'urgent': [],      # 8-14 days\n                'moderate': [],    # 15-30 days\n                'planned': []      # > 30 days\n            },\n            'deadline_details': deadlines\n        }\n        \n        # Categorize deadlines\n        for deadline in deadlines:\n            category = deadline['category']\n            days_until = deadline['days_until']\n            \n            # Count by category\n            if category not in report['deadlines_by_category']:\n                report['deadlines_by_category'][category] = 0\n            report['deadlines_by_category'][category] += 1\n            \n            # Categorize by urgency\n            if days_until <= 7:\n                report['deadlines_by_urgency']['critical'].append(deadline)\n            elif days_until <= 14:\n                report['deadlines_by_urgency']['urgent'].append(deadline)\n            elif days_until <= 30:\n                report['deadlines_by_urgency']['moderate'].append(deadline)\n            else:\n                report['deadlines_by_urgency']['planned'].append(deadline)\n        \n        # Add summary statistics\n        report['urgency_summary'] = {\n            'critical_count': len(report['deadlines_by_urgency']['critical']),\n            'urgent_count': len(report['deadlines_by_urgency']['urgent']),\n            'moderate_count': len(report['deadlines_by_urgency']['moderate']),\n            'planned_count': len(report['deadlines_by_urgency']['planned'])\n        }\n        \n        return report\n    \n    def setup_automated_reminders(self, email_config: Dict[str, str] = None) -> bool:\n        \"\"\"Setup automated email reminders for deadlines\"\"\"\n        \n        logger.info(\"Setting up automated reminder system\")\n        \n        # This would typically involve setting up a scheduled job\n        # For now, we'll create a configuration for future implementation\n        \n        reminder_config = {\n            'enabled': True,\n            'check_frequency_hours': 24,\n            'email_config': email_config or {},\n            'reminder_thresholds': {\n                'critical': 7,   # Send daily reminders\n                'urgent': 14,    # Send every 2 days\n                'moderate': 30   # Send weekly\n            },\n            'notification_methods': ['email', 'calendar_popup']\n        }\n        \n        # Save configuration\n        config_path = 'reminder_config.json'\n        with open(config_path, 'w') as f:\n            json.dump(reminder_config, f, indent=2)\n        \n        logger.info(f\"Reminder configuration saved to {config_path}\")\n        return True\n\ndef main():\n    \"\"\"Main function for testing Calendar Manager\"\"\"\n    \n    logger.info(\"Testing Zantara Calendar Manager\")\n    \n    # Note: This requires actual Google Calendar API credentials\n    # For testing without credentials, we'll simulate the functionality\n    \n    try:\n        manager = ZantaraCalendarManager()\n        \n        # Test deadline report generation\n        report = manager.generate_deadline_report(30)\n        logger.info(\"Deadline Report:\")\n        logger.info(json.dumps(report, indent=2, default=str))\n        \n        # Test creating a sample visa deadline\n        future_date = datetime.utcnow() + timedelta(days=30)\n        event_id = manager.create_visa_deadline(\n            country=\"Italy\",\n            document_type=\"Tourist Visa\",\n            deadline_date=future_date,\n            applicant_name=\"John Doe\",\n            passport_number=\"AB123456\"\n        )\n        \n        if event_id:\n            logger.info(f\"Created test visa deadline: {event_id}\")\n        \n        return manager\n        \n    except Exception as e:\n        logger.error(f\"Error in main: {e}\")\n        \n        # Return a mock manager for testing\n        logger.info(\"Creating mock calendar manager for testing\")\n        \n        mock_report = {\n            'report_date': datetime.utcnow().isoformat(),\n            'total_deadlines': 3,\n            'deadlines_by_category': {\n                'visa': 2,\n                'tax': 1\n            },\n            'urgency_summary': {\n                'critical_count': 1,\n                'urgent_count': 1,\n                'moderate_count': 1,\n                'planned_count': 0\n            },\n            'status': 'mock_mode - requires Google Calendar API setup'\n        }\n        \n        logger.info(\"Mock Calendar Report:\")\n        logger.info(json.dumps(mock_report, indent=2, default=str))\n        \n        return None\n\nif __name__ == \"__main__\":\n    main()"