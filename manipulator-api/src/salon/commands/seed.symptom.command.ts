import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { SymptomService } from '@src/salon/services/symptom.service';

const masterData = [
  // Autonomic Nervous System Symptoms
  {
    _id: 1,
    typeId: 1,
    typeName: 'Autonomic Nervous System Symptoms',
    symptomName: 'Chronic Fatigue Syndrome',
  },
  { _id: 2, typeId: 1, typeName: 'Autonomic Nervous System Symptoms', symptomName: 'Postpartum Depression' },
  { _id: 3, typeId: 1, typeName: 'Autonomic Nervous System Symptoms', symptomName: 'Cold Sensitivity' },
  { _id: 4, typeId: 1, typeName: 'Autonomic Nervous System Symptoms', symptomName: 'Menopause Symptoms' },
  {
    _id: 5,
    typeId: 1,
    typeName: 'Autonomic Nervous System Symptoms',
    symptomName: 'Irritable Bowel Syndrome',
  },
  {
    _id: 6,
    typeId: 1,
    typeName: 'Autonomic Nervous System Symptoms',
    symptomName: 'PMS (Premenstrual Syndrome)',
  },
  { _id: 7, typeId: 1, typeName: 'Autonomic Nervous System Symptoms', symptomName: 'Gastroesophageal Reflux' },
  {
    _id: 8,
    typeId: 1,
    typeName: 'Autonomic Nervous System Symptoms',
    symptomName: 'Autonomic Dysfunction',
  },
  { _id: 9, typeId: 1, typeName: 'Autonomic Nervous System Symptoms', symptomName: 'Cervical Spondylosis' },
  { _id: 10, typeId: 1, typeName: 'Autonomic Nervous System Symptoms', symptomName: 'Dizziness' },
  { _id: 11, typeId: 1, typeName: 'Autonomic Nervous System Symptoms', symptomName: 'Stiff Neck' },
  { _id: 12, typeId: 1, typeName: 'Autonomic Nervous System Symptoms', symptomName: 'Headache' },
  { _id: 13, typeId: 1, typeName: 'Autonomic Nervous System Symptoms', symptomName: 'Temporomandibular Joint Disorder' },
  {
    _id: 14,
    typeId: 1,
    typeName: 'Autonomic Nervous System Symptoms',
    symptomName: 'Orthostatic Hypotension',
  },
  // Neck and Shoulder Symptoms
  {
    _id: 15,
    typeId: 2,
    typeName: 'Neck and Shoulder Symptoms',
    symptomName: 'Forward Head Posture',
  },
  { _id: 16, typeId: 2, typeName: 'Neck and Shoulder Symptoms', symptomName: 'Headache' },
  {
    _id: 17,
    typeId: 2,
    typeName: 'Neck and Shoulder Symptoms',
    symptomName: 'Bicipital Tendonitis',
  },
  { _id: 18, typeId: 2, typeName: 'Neck and Shoulder Symptoms', symptomName: 'Scalene Syndrome' },
  { _id: 19, typeId: 2, typeName: 'Neck and Shoulder Symptoms', symptomName: 'Carpal Tunnel Syndrome' },
  { _id: 20, typeId: 2, typeName: 'Neck and Shoulder Symptoms', symptomName: 'Thoracic Spine' },
  { _id: 21, typeId: 2, typeName: 'Neck and Shoulder Symptoms', symptomName: 'Arm Numbness' },
  { _id: 22, typeId: 2, typeName: 'Neck and Shoulder Symptoms', symptomName: 'Cervical Brachial Syndrome' },
  { _id: 23, typeId: 2, typeName: 'Neck and Shoulder Symptoms', symptomName: 'Rotator Cuff Injury' },
  { _id: 24, typeId: 2, typeName: 'Neck and Shoulder Symptoms', symptomName: 'Cubital Tunnel Syndrome' },
  { _id: 25, typeId: 2, typeName: 'Neck and Shoulder Symptoms', symptomName: 'TFCC Injury' },
  { _id: 26, typeId: 2, typeName: 'Neck and Shoulder Symptoms', symptomName: 'Finger Numbness' },
  { _id: 27, typeId: 2, typeName: 'Neck and Shoulder Symptoms', symptomName: 'Cervical Herniation' },
  {
    _id: 28,
    typeId: 2,
    typeName: 'Neck and Shoulder Symptoms',
    symptomName: 'Loose Shoulder',
  },
  {
    _id: 29,
    typeId: 2,
    typeName: 'Neck and Shoulder Symptoms',
    symptomName: 'Frozen Shoulder',
  },
  { _id: 30, typeId: 2, typeName: 'Neck and Shoulder Symptoms', symptomName: 'Tendonitis' },
  { _id: 31, typeId: 2, typeName: 'Neck and Shoulder Symptoms', symptomName: 'Shoulder Stiffness' },
  // Hip, Knee, and Foot Symptoms
  {
    _id: 32,
    typeId: 3,
    typeName: 'Hip, Knee, and Foot Symptoms',
    symptomName: 'Calf Numbness',
  },
  {
    _id: 33,
    typeId: 3,
    typeName: 'Hip, Knee, and Foot Symptoms',
    symptomName: 'Tarsal Tunnel Syndrome',
  },
  {
    _id: 34,
    typeId: 3,
    typeName: 'Hip, Knee, and Foot Symptoms',
    symptomName: 'Flat Feet',
  },
  {
    _id: 35,
    typeId: 3,
    typeName: 'Hip, Knee, and Foot Symptoms',
    symptomName: 'Piriformis Syndrome',
  },
  {
    _id: 36,
    typeId: 3,
    typeName: 'Hip, Knee, and Foot Symptoms',
    symptomName: 'Achilles Tendonitis',
  },
  {
    _id: 37,
    typeId: 3,
    typeName: 'Hip, Knee, and Foot Symptoms',
    symptomName: 'Jumper\'s Knee',
  },
  {
    _id: 38,
    typeId: 3,
    typeName: 'Hip, Knee, and Foot Symptoms',
    symptomName: 'Pes Anserine Bursitis',
  },
  { _id: 39, typeId: 3, typeName: 'Hip, Knee, and Foot Symptoms', symptomName: 'Knock Knees' },
  {
    _id: 40,
    typeId: 3,
    typeName: 'Hip, Knee, and Foot Symptoms',
    symptomName: 'Hip Osteoarthritis',
  },
  {
    _id: 41,
    typeId: 3,
    typeName: 'Hip, Knee, and Foot Symptoms',
    symptomName: 'Heel Pain',
  },
  {
    _id: 42,
    typeId: 3,
    typeName: 'Hip, Knee, and Foot Symptoms',
    symptomName: 'Knee Osteoarthritis',
  },
  {
    _id: 43,
    typeId: 3,
    typeName: 'Hip, Knee, and Foot Symptoms',
    symptomName: 'Knee and Hip Pain',
  },
  {
    _id: 44,
    typeId: 3,
    typeName: 'Hip, Knee, and Foot Symptoms',
    symptomName: 'Snapping Hip',
  },
  {
    _id: 45,
    typeId: 3,
    typeName: 'Hip, Knee, and Foot Symptoms',
    symptomName: 'Iliotibial Band Syndrome',
  },
  // Sports Injuries
  { _id: 46, typeId: 4, typeName: 'Sports Injuries', symptomName: 'Baseball Shoulder' },
  { _id: 47, typeId: 4, typeName: 'Sports Injuries', symptomName: 'Tennis Elbow' },
  { _id: 48, typeId: 4, typeName: 'Sports Injuries', symptomName: 'Golfer\'s Elbow' },
  { _id: 49, typeId: 4, typeName: 'Sports Injuries', symptomName: 'Osgood-Schlatter Disease' },
  { _id: 50, typeId: 4, typeName: 'Sports Injuries', symptomName: 'Plantar Fasciitis' },
  { _id: 51, typeId: 4, typeName: 'Sports Injuries', symptomName: 'TFCC' },
  // Lower Back Symptoms
  {
    _id: 52,
    typeId: 5,
    typeName: 'Lower Back Symptoms',
    symptomName: 'Hyperlordosis',
  },
  { _id: 53, typeId: 5, typeName: 'Lower Back Symptoms', symptomName: 'Muscular Low Back Pain' },
  { _id: 54, typeId: 5, typeName: 'Lower Back Symptoms', symptomName: 'Lumbar Spondylolisthesis' },
  { _id: 55, typeId: 5, typeName: 'Lower Back Symptoms', symptomName: 'Back Pain' },
  { _id: 56, typeId: 5, typeName: 'Lower Back Symptoms', symptomName: 'Low Back Pain' },
  { _id: 57, typeId: 5, typeName: 'Lower Back Symptoms', symptomName: 'Lumbar Herniation' },
  { _id: 58, typeId: 5, typeName: 'Lower Back Symptoms', symptomName: 'Lumbar Spinal Stenosis' },
  { _id: 59, typeId: 5, typeName: 'Lower Back Symptoms', symptomName: 'Sciatica' },
  { _id: 60, typeId: 5, typeName: 'Lower Back Symptoms', symptomName: 'Sacroiliac Joint Dysfunction' },
  { _id: 61, typeId: 5, typeName: 'Lower Back Symptoms', symptomName: 'Acute Low Back Pain' },
];

@Injectable()
export class SeedSymptomCommand {
  constructor(private readonly symptomService: SymptomService) {}

  @Command({
    command: 'seed:symptom',
    describe: 'Populating the symptoms master data',
  })
  async create() {
    for (const item of masterData) {
      const { _id, typeId, typeName, symptomName } = item;
      // creating records without dupplicated
      await this.symptomService.findOneAndUpdate(
        { _id },
        { _id, typeId, symptomName, typeName },
        { upsert: true },
      );
    }
  }
}
