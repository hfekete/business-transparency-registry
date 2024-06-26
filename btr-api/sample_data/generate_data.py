# Copyright © 2024 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""The BTR data generator script."""
import csv
import sys

import pycountry
from faker import Faker
from flask import current_app
from random import choice, randint, sample

from btr_api import create_app
from btr_api.models import User, db
from btr_api.services import SubmissionService

fake = Faker()

INTEREST_TYPES = ['otherInfluenceOrControl', 'shareholding', 'votingRights']

# Data generation setup: 
# mapping of locale to the number of filings and the number of SI individuals in a filing (A: [B, C])
# A: the locale used for generating sample data, 
# B: the number of filings to generate (each filing will have a unique business identifier),
# C: the number of SI individuals in a filing
SETTING = {
    'en_CA': [1000, 1],
    'fr_CA': [500, 2],
    'first_nations_CA': [500, 2]
}

def get_fake_date() -> str:
    """Return a fake date."""
    return str(fake.date_this_decade())


def _get_ooc_interests(date):
    """Return the ooc interests."""
    ooc_interests: list[dict] = []
    interest_types = sample(INTEREST_TYPES, randint(1, len(INTEREST_TYPES)))
    for interest_type in interest_types:
        interest = {
            'type': interest_type,
            'beneficialOwnershipOrControl': True,
            'directOrIndirect': choice(['direct', 'indirect', 'unknown']),
            'startDate': date,
        }
        if interest['type'] in ['shareholding', 'votingRights']:
            interest['share'] = choice([{'maximum': 100, 'minimum': 75}, {'maximum': 75, 'minimum': 50}, {'maximum': 50, 'minimum': 25}])
            interest['details'] = 'controlType.sharesOrVotes.registeredOwner'
        elif interest['type'] == 'otherInfluenceOrControl':
            interest['details'] = 'other reasons'

        ooc_interests.append(interest)

    return ooc_interests


def _get_ooc_stmnts(entity_stmnt, person_stmnts):
    """Return the ooc statements."""
    ooc_stmnts: list[dict] = []
    for person in person_stmnts:
        ooc_stmnts.append({
            'statementID': 'sample-ooc-' + fake.uuid4(),
            'statementType': 'ownershipOrControlStatement',
            'statementDate': entity_stmnt['statementDate'],
            'isComponent': choice([True, False]),
            'subject': {'describedByEntityStatement': entity_stmnt['statementID']},
            'interestedParty': {'describedByPersonStatement': person['statementID']},
            'publicationDetails': entity_stmnt['publicationDetails'],
            'interests': _get_ooc_interests(entity_stmnt['statementDate'])
        })

    return ooc_stmnts


def _get_entity_stmnt(statement_date: str):
    """Return the entity statements."""
    return {
        'statementID': 'sample-entity-' + fake.uuid4(),
        'statementType': choice(['business', 'branch']),
        'statementDate': statement_date, 
        'isComponent': choice([True, False]),
        'entityType': 'legalEntity',
        'name': fake.company(),
        'identifiers': [{'id': f"TST-E{fake.uuid4()}", 'scheme': 'TST-E'}],
        'publicationDetails': {
            "publicationDate":  statement_date,
            "bodsVersion": "3.0",
            "publisher": {
                "uri": "http://publisher.uri",
                "name": "Publisher Name",
                "source": {
                "url": "http://source.url"
                }
            }
        }
    }


def _get_first_nations_names() -> list[tuple[str,str]]:
    """Return the first nations names."""
    first_nations_names = []
    with open('first_nation_names.csv', mode='r', newline='', encoding='utf-8') as file:
        reader = csv.reader(file)
        for row in reader:
            if row:
                full_name = row[0]
                if len(row) == 2:
                    preferred_name = row[1]
                else:
                    preferred_name = ''
                first_nations_names.append((full_name, preferred_name))

    return first_nations_names


def _get_person_stmnts(statement_date: str, locale: str, fn_names: list[tuple[str,str]], num: int = 1):
    """Return the person statements."""
    person_stmnts: list[dict] = []

    def get_random_email():
        """Return a randomly generated email."""
        return (fake.name()).replace(' ', '_') + '@test.com'
    
    def get_country_from_locale():
        """Return the country object based on the given locale."""
        return pycountry.countries.get(alpha_2=locale.split('_')[-1])

    for _ in range(num):
        if locale == 'first_nations_CA':
            fn_name_info = choice(fn_names)
            names = [
                {'type': 'individual', 'fullName': fn_name_info[0]},
                {'type': 'alternative', 'fullName': fn_name_info[1]}
            ]
        else:
            names = [
                {'type': 'individual', 'fullName': fake.name()},
                {'type': 'alternative', 'fullName': fake.name()}
            ]

        address_country = get_country_from_locale()

        address = {
            'street': fake.street_address(),
            'city': fake.city(),
            'country': address_country.alpha_2,
            'countryName': address_country.name,
            'postalCode': fake.postcode()
        }

        if address_country.alpha_2 == 'CA':
            address['region'] = fake.province_abbr()
        elif address_country.alpha_2 == 'US':
            address['region'] = fake.state_abbr()

        nationality_country = fake.random_element(pycountry.countries)

        nationality = {
            'code': nationality_country.alpha_2,
            'name': nationality_country.name
        }

        person_stmnts.append({
            'statementID': 'sample-person-' + fake.uuid4(),
            'statementType': choice(['individual', 'organization']),
            'statementDate': statement_date,
            'personType': 'knownPerson',
            'isComponent': choice([True, False]),
            'publicationDetails': {
                "publicationDate":  statement_date,
                "bodsVersion": "3.0",
                "publisher": {
                    "uri": "http://publisher.uri",
                    "name": "Publisher Name",
                    "source": {
                    "url": "http://source.url"
                    }
                }
            },
            'names': names,
            'nationalities': [nationality],
            'identifiers': [
                # NOTE: fake identifiers + tax numbers
                {'id': f"TST-P{fake.uuid4()}", 'scheme': 'TST-P'},
                {'id': f"TST-TAX{fake.uuid4()}", 'scheme': 'TST-TAX'},
            ],
            
            'birthDate': statement_date,
            'addresses': [address],
            'placeOfResidence': address,
            'taxResidencies': [nationality],
            'email': get_random_email(),
            'hasTaxNumber': choice([True, False])
        })

    return person_stmnts


def _get_filing(entity_stmnt: dict, person_stmnts: dict, ooc_stmnts: list, locale: str):
    """Return the filing based on the given statements."""
    filings = {
        'businessIdentifier': locale + '_business_' + fake.uuid4(),
        'effectiveDate': entity_stmnt['statementDate'],
        'entityStatement': entity_stmnt,
        'personStatements': person_stmnts,
        'ownershipOrControlStatements': ooc_stmnts
    }
    return filings


def generate_data():
    """Generate sample data for search."""
    user = User.find_by_username('service-account-btr')

    if not user:
        current_app.logger.debug('error user not found.')
        return
    
    global fake

    for locale, settings in SETTING.items():
        first_nations_names = []
        if locale == 'first_nations_CA':
            fake = Faker('en_CA')
            first_nations_names = _get_first_nations_names()
        else:
            fake = Faker(locale)
        
        for _ in range(settings[0]):
            date = get_fake_date()
            entity_stmnt = _get_entity_stmnt(date)
            person_stmnts = _get_person_stmnts(date, locale, first_nations_names, settings[1])
            ooc_stmnts = _get_ooc_stmnts(entity_stmnt, person_stmnts)
            filing = _get_filing(entity_stmnt, person_stmnts, ooc_stmnts, locale)
            SubmissionService.create_submission(filing, user.id).save_to_session()
        
        db.session.commit()
        current_app.logger.debug(f'Successfully generated sample data for {locale}.')


if __name__ == '__main__':
    print('Generating sample data...')
    app = create_app()  # pylint: disable=invalid-name
    with app.app_context():
        generate_data()
        sys.exit(0)
