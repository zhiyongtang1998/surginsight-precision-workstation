export interface LayerDef {
  id: string;
  label: string;
  meshNames: string[];
  defaultVisible: boolean;
}

export const LAYER_CONFIG: LayerDef[] = [
  {
    id: 'skin', label: 'Skin',
    meshNames: ['Skin_1', 'Skin_2', 'Hair', 'Scalp_head', 'Boxers', 'Eyelash', 'Skin_penis', 'Eye_L', 'Eye_R'],
    defaultVisible: true,
  },
  {
    id: 'lungs', label: 'Lungs',
    meshNames: ['Right_Lung', 'Left_Lung'],
    defaultVisible: true,
  },
  {
    id: 'airways', label: 'Airways',
    meshNames: ['Trachea', 'Right_Bronchus', 'Left_Bronchus'],
    defaultVisible: true,
  },
  {
    id: 'heart', label: 'Heart',
    meshNames: [
      'Capslice_Type2', 'Back_Heart', 'Pulmonary_valve', 'Aortic_valve',
      'Mitral_valve', 'Tricuspic_valve', 'Pulmonary_vein_', 'Pulmoneryartery',
    ],
    defaultVisible: true,
  },
  {
    id: 'vessels', label: 'Vessels',
    meshNames: [
      'Superior_vena_cava_Veins', 'Aortaa', 'Aortic_arteries',
      'Pulmonary_Veins_R', 'Pulmonary_Veins_L_001',
      'Pulmonary_superior_arteries_R', 'Pulmonary_superior_arteries_L_001',
      'Pulmonary_inferior_arteries_R', 'Pulmonary_inferior___arteries_L',
      'Head_neck_arteries', 'Head_neck001_Veins',
      'thorax_arteries_001', 'thorax_Veins',
    ],
    defaultVisible: true,
  },
  {
    id: 'diaphragm', label: 'Diaphragm',
    meshNames: ['Diaphragm_002'],
    defaultVisible: true,
  },
  {
    id: 'esophagus', label: 'Esophagus',
    meshNames: ['Esophagus_'],
    defaultVisible: true,
  },
  {
    id: 'ribs', label: 'Ribs',
    meshNames: [
      'first_rib_L', 'first_rib_R', 'Second_rib_L', 'Second_rib_R',
      'Third_rib_L', 'Third_rib_R', 'Fourth_rib_L', 'Fourth_rib_R',
      'Fifth_rib_L', 'Fifth_rib_R', 'Sixth_rib_L_001', 'Sixth_rib_R',
      'seventh_rib_L', 'seventh_rib_R', 'Eighth_rib_L', 'Eighth_rib_R',
      'ninth_rib_L', 'ninth_rib_R', 'Tenth_rib_L', 'Tenth_rib_R',
      'Eleventh_rib_L', 'Eleventh_rib_R', 'Twelfth_rib_L', 'Twelfth_rib_R',
      'Body_of_sternum', 'Manubrium_', 'Xiphoid_process',
    ],
    defaultVisible: true,
  },
  {
    id: 'spine', label: 'Spine',
    meshNames: [
      'C01_Atlas', 'C02_Axis',
      'C03_Vertebra', 'C04_Vertebra', 'C05_Vertebra', 'C06_Vertebra', 'C07_Vertebra',
      'T01_Vertebra', 'T02_Vertebra', 'T03_Vertebra', 'T04_Vertebra', 'T05_Vertebra',
      'T06_Vertebra', 'T07_Vertebra', 'T08_Vertebra', 'T09_Vertebra', 'T10_Vertebra',
      'T11_Vertebra', 'T12_Vertebra', 'L01_Vertebra', 'L02_Vertebra',
      'L03_Vertebra', 'L04_Vertebra', 'L05_Vertebra', 'Intervertebral_disc',
    ],
    defaultVisible: true,
  },
  {
    id: 'shoulder', label: 'Shoulder',
    meshNames: [
      'Clavicle_L', 'Clavicle_R', 'Scapula_L', 'Scapula_R',
      'Articular_capsule_L', 'Articular_capsule_R',
      'Acromioclavicular_ligament_L', 'Acromioclavicular_ligament_R',
      'Coracoacromial_ligament001_L', 'Coracoacromial_ligament_R',
      'Coracoacromial_ligament_conoid_L', 'Coracoacromial_ligament_conoid_R',
      'Coracoacromial_ligament_trapeizoid_L', 'Coracoacromial_ligament_trapeizoid_R',
      'Coracohumeral_ligament_L', 'Coracohumeral_ligament_R',
      'Sternoclavicular_ligament_L', 'Sternoclavicular_ligament_R',
      'superior_transverse_scapular_ligament_L', 'superior_transverse_scapular_ligament_R',
      'Inferior_glenohumeral_ligament_L', 'Inferior_glenohumeral_ligament_R',
      'Middle_glenohumeral_ligament_L', 'Middle_glenohumeral_ligament_R',
      'Superior_glenohumeral_ligament_L', 'Superior_glenohumeral_ligament_R',
    ],
    defaultVisible: true,
  },
  {
    id: 'nerves', label: 'Nerves',
    meshNames: ['Nervous_', 'Nervous__001'],
    defaultVisible: true,
  },
  {
    id: 'spine_ligaments', label: 'Spine Ligaments',
    meshNames: [
      'Anterior_longitudinal_ligament',
      'Intertransverse_ligaments_L', 'Intertransverse_ligaments_R',
      'Ligamenta_flava', 'Supraspinous_ligament',
    ],
    defaultVisible: true,
  },
  {
    id: 'spinal_cord', label: 'Spinal Cord',
    meshNames: ['Spinal_cord_membrane_', 'Spinal_cords_1', 'Spinal_cords_2'],
    defaultVisible: true,
  },
  {
    id: 'larynx', label: 'Larynx',
    meshNames: [
      'Arythenoid_cartilage', 'Conus_elasticus', 'Corniculate_cartilage',
      'Cricoid_cartilage', 'cricopharyngeal_ligament', 'Cuneiform_cartilage',
      'Epiglottic_cartilage', 'Median_Thyrohyoid', 'Quadrangular_membrane',
      'Thyro-epiglottic_ligament', 'Thyroglossal_duct',
      'Thyrohyoid_membrane', 'Thyrohyoid_membrane_001',
      'Thyroid_cartilage', 'vestibular_ligament',
    ],
    defaultVisible: true,
  },
  {
    id: 'hyoid', label: 'Hyoid',
    meshNames: ['Hyoio_Bone', 'HYO-Epiglottic_Ligament'],
    defaultVisible: true,
  },
  {
    id: 'upper_cervical', label: 'Upper Cervical',
    meshNames: ['Atlanto_occipital_capsule', 'Posterior_atlanto_occipital_membrane', 'Tectorial_membrane_of_atlanto'],
    defaultVisible: true,
  },
  {
    id: 'abdomen_vessels', label: 'Abdomen Vessels',
    meshNames: [
      'abdomen_inferior_vena_cavav_Veins', 'Abdomen_aorta_abdominalis_arteries',
      'Liver_arteries', 'Liver_Veins',
      'Gut_arteries', 'Gut_Veins',
      'Kidney__arteries_L', 'Kidney__arteries_R_001',
      'Kidney__Veins_L_001', 'Kidney__Veins_R',
    ],
    defaultVisible: true,
  },
  {
    id: 'limb_vessels', label: 'Limb Vessels',
    meshNames: [
      'Upper_limb_arteries_L', 'Upper_limb_arteries_R',
      'Upper_limb_Veins_L', 'Upper_limb_Veins_R',
      'Pelvis_arteries', 'Pelvis_Veins_001',
    ],
    defaultVisible: true,
  },
];

export const TUMOR_CONFIG = {
  url: `${import.meta.env.BASE_URL}models/tumor_V2.glb`,
  position: { x: 0.04, y: 1.38, z: 0.02 },
  scale: 0.005,
} as const;
