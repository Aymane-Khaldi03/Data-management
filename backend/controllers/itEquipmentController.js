const ITEquipment = require('../models/ITEquipment');

exports.getITEquipments = async (req, res) => {
  try {
    console.log('Fetching all IT equipments...');
    const itEquipments = await ITEquipment.findAll();
    console.log('Fetched IT equipments:', itEquipments);
    res.json(itEquipments);
  } catch (err) {
    console.error('Error fetching IT equipments:', err.message);
    res.status(500).send('Server error');
  }
};

exports.getITEquipmentById = async (req, res) => {
  try {
    const itEquipment = await ITEquipment.findByPk(req.params.id);
    if (!itEquipment) {
      return res.status(404).json({ msg: 'IT Equipment not found' });
    }
    res.json(itEquipment);
  } catch (err) {
    console.error('Error fetching IT equipment by ID:', err.message);
    res.status(500).send('Server error');
  }
};

exports.createITEquipment = async (req, res) => {
  const {
    categorie, marque, model, code_materiel, serie, code_localisation, code_entite,
    date_installation, fin_garantie, statut, type_acquisition, date_achat, date_livraison,
    fournisseur, numero_facture, prix_achat, numero_appel_offre, numero_livraison,
    cout_maintenance, emploi_principal, niveau_criticite, sla, date_sortie, commentaire
  } = req.body;

  try {
    const newITEquipment = await ITEquipment.create({
      categorie, marque, model, code_materiel, serie, code_localisation, code_entite,
      date_installation, fin_garantie, statut, type_acquisition, date_achat, date_livraison,
      fournisseur, numero_facture, prix_achat, numero_appel_offre, numero_livraison,
      cout_maintenance, emploi_principal, niveau_criticite, sla, date_sortie, commentaire
    });

    console.log('Created new IT equipment:', newITEquipment);
    res.json(newITEquipment);
  } catch (err) {
    console.error('Error during IT equipment creation:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.updateITEquipment = async (req, res) => {
  const {
    categorie, marque, model, code_materiel, serie, code_localisation, code_entite,
    date_installation, fin_garantie, statut, type_acquisition, date_achat, date_livraison,
    fournisseur, numero_facture, prix_achat, numero_appel_offre, numero_livraison,
    cout_maintenance, emploi_principal, niveau_criticite, sla, date_sortie, commentaire
  } = req.body;

  try {
    let itEquipment = await ITEquipment.findByPk(req.params.id);

    if (!itEquipment) {
      return res.status(404).json({ msg: 'IT Equipment not found' });
    }

    itEquipment.categorie = categorie || itEquipment.categorie;
    itEquipment.marque = marque || itEquipment.marque;
    itEquipment.model = model || itEquipment.model;
    itEquipment.code_materiel = code_materiel || itEquipment.code_materiel;
    itEquipment.serie = serie || itEquipment.serie;
    itEquipment.code_localisation = code_localisation || itEquipment.code_localisation;
    itEquipment.code_entite = code_entite || itEquipment.code_entite;
    itEquipment.date_installation = date_installation || itEquipment.date_installation;
    itEquipment.fin_garantie = fin_garantie || itEquipment.fin_garantie;
    itEquipment.statut = statut || itEquipment.statut;
    itEquipment.type_acquisition = type_acquisition || itEquipment.type_acquisition;
    itEquipment.date_achat = date_achat || itEquipment.date_achat;
    itEquipment.date_livraison = date_livraison || itEquipment.date_livraison;
    itEquipment.fournisseur = fournisseur || itEquipment.fournisseur;
    itEquipment.numero_facture = numero_facture || itEquipment.numero_facture;
    itEquipment.prix_achat = prix_achat || itEquipment.prix_achat;
    itEquipment.numero_appel_offre = numero_appel_offre || itEquipment.numero_appel_offre;
    itEquipment.numero_livraison = numero_livraison || itEquipment.numero_livraison;
    itEquipment.cout_maintenance = cout_maintenance || itEquipment.cout_maintenance;
    itEquipment.emploi_principal = emploi_principal || itEquipment.emploi_principal;
    itEquipment.niveau_criticite = niveau_criticite || itEquipment.niveau_criticite;
    itEquipment.sla = sla || itEquipment.sla;
    itEquipment.date_sortie = date_sortie || itEquipment.date_sortie;
    itEquipment.commentaire = commentaire || itEquipment.commentaire;

    await itEquipment.save();
    console.log('Updated IT equipment:', itEquipment);
    res.json(itEquipment);
  } catch (err) {
    console.error('Error updating IT equipment:', err.message);
    res.status(500).send('Server error');
  }
};

exports.deleteITEquipment = async (req, res) => {
  try {
    const itEquipment = await ITEquipment.findByPk(req.params.id);
    if (!itEquipment) {
      return res.status(404).json({ msg: 'IT Equipment not found' });
    }

    await itEquipment.destroy();
    console.log('Deleted IT equipment:', itEquipment);
    res.json({ msg: 'IT Equipment removed' });
  } catch (err) {
    console.error('Error deleting IT equipment:', err.message);
    res.status(500).send('Server error');
  }
};
